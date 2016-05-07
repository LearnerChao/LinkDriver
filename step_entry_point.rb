require 'watir-webdriver'
require 'set'
require 'json'
require 'logger'
require_relative 'linkedin_page'
require_relative 'records'

# initialize
config_reader = JSON.parse(File.read(ARGV[0]))
browser = Watir::Browser.new :chrome
current_dir = File.expand_path(File.dirname(__FILE__))
file = File.open(ARGV[1], File::WRONLY | File::APPEND | File::CREAT)
# To create new (and to remove old) logfile, add File::CREAT like:
# file = File.open('foo.log', File::WRONLY | File::APPEND | File::CREAT)
logger = Logger.new(file)
linkedin_page = LinkedinPage.new(browser, logger)
records = Records.new(config_reader)
DELIMITER = ','


# open linkedin 
linkedin_page.go_to_login_page config_reader['server_url']

# login account
linkedin_page.login_page_username.set config_reader["login"]["username"]
linkedin_page.login_page_password.set config_reader["login"]["password"]
linkedin_page.login_page_submit.click
linkedin_page.index_page.wait_until_present

# Set search keyword
linkedin_page.search_box.set config_reader["search"]["keywords"]
linkedin_page.search_button.click
linkedin_page.search_result_page.wait_until_present

# Set filters
filters = config_reader["search"]["filters"]
logger.info("started setting up filters")
filters.each do |key, value|
	case key
	when 'type'
		linkedin_page.search_type_selector(value).click unless value.nil?
		Watir::Wait.while {linkedin_page.search_loading}
		logger.info("set type as #{value}")
	when 'relationship_to_uncheck'
		value.split(DELIMITER).each do |val|
			linkedin_page.search_relationship_selector(val).clear
			logger.info("unchecked relationship #{val}")
			Watir::Wait.while {linkedin_page.search_loading}
		end
	when 'relationship_to_check'
		value.split(DELIMITER).each do |val|
			linkedin_page.search_relationship_selector(val).set
			logger.info("checked relationship #{val}")
			Watir::Wait.while {linkedin_page.search_loading}
		end		
	when 'location'
		value.split(DELIMITER).each do |val|
			linkedin_page.search_locations(val).set
			logger.info("set location as #{val}")
			Watir::Wait.while {linkedin_page.search_loading}
		end	
	else
		logger.warn("Some of your filters are ignored")
	end
end

# start sending invitation
index = 0
page = 1
logger.info("started sending invitation")
while true
	begin
		results = linkedin_page.search_results(index)
		if !results.nil?
			results.each_with_index do |li, i|
				begin
					index = index + 1
					if !((li.class_name.include? "people") && (linkedin_page.name_exist? li) && (linkedin_page.description_exist? li))
						next;
					end	 
					name = linkedin_page.name_of_person(li)
					description = linkedin_page.description_of_person(li)
					if records.exists?(name, description) then
						logger.info("We already sent invitiation to #{name} before.")
						next
					else
						records.add(name, description)
					end

					if !linkedin_page.blue_button_exists?(li) then	
						logger.debug("can not find blue button for #{name}")
						next
					else
						blue_button = linkedin_page.blue_button(li)
					end

					if blue_button.text == 'Message'
						logger.info("Already Connected with #{name}")
					elsif blue_button.text == 'Follow'
						blue_button.click
						logger.info("Now following #{name}")
					elsif blue_button.text == 'Connect'
						blue_button.when_present.click
						sleep 2
						if linkedin_page.need_email_page?
							browser.back
							logger.info("Need email address to connect with #{name}")
							linkedin_page.search_result_page.wait_until_present
							break
						else
							logger.info("Invitation has been sent to #{name}")
						end
					end
				rescue
					logger.error("Had exception during #{li.to_s}")
					next;
				end			
			end

			# navigate to next page
			if index > (results.length - 1)
				puts "Page #{page}, index: #{index}, length: #{results.length}"
				if linkedin_page.next_page.exists? then
					linkedin_page.next_page.click
					page = page + 1
					index = 0
					logger.info("next page loading...")
					sleep 2 
					Watir::Wait.while {linkedin_page.search_loading}
				else
					break
				end
			end
		end
	rescue
		logger.error("Exception during fetching results in this page")
		if linkedin_page.next_page.exists? then
			linkedin_page.next_page.click
			page = page + 1
			index = 0
			logger.info("next page loading...")
			sleep 2 
			Watir::Wait.while {linkedin_page.search_loading}
		else
			break
		end
	end
end
browser.close
records.file_close

