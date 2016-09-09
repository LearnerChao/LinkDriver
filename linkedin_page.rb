class LinkedinPage
	def initialize(browser, logger)
		@browser = browser
		@logger = logger
	end

	def go_to_login_page url
		@browser.goto url
	end

	def login_page_username
		@browser.text_field(:id => 'login-email')
	end

	def login_page_password
		@browser.text_field(:id => 'login-password')
	end

	def login_page_submit
		@browser.button(:name => 'submit')
	end

	def index_page
		@browser.body(:id => 'pagekey-oz-winner')
	end

	def search_button
		@browser.button(:name => 'search')
	end

	def search_box
		@browser.text_field(:id => 'main-search-box')
	end

	def search_result_page
		@browser.div(:id => 'results-col')
	end

	def search_type_selector type
		@browser.div(:id => 'search-types').div(:class => 'search-types').link(:text => type)
	end

	def search_relationship_selector relation	
		case relation
		when '1'
			return search_relationship_1st
		when '2'
			return search_relationship_2nd
		when '3'
			return search_relationship_3rd_plus
		when 'g'
			return search_relationship_group_members
		else 
			logger.error("undefined relationship: #{relation}! Check property file")
		end	
	end

	def search_relationship_1st
		@browser.checkbox(:id => 'F-N-ffs')
	end

	def search_relationship_2nd
		@browser.checkbox(:id => 'S-N-ffs')
	end	

	def search_relationship_group_members
		@browser.checkbox(:id => 'A-N-ffs')
	end	

	def search_relationship_3rd_plus
		@browser.checkbox(:id => 'O-N-ffs')
	end	

	def search_locations location_id
		@browser.checkbox(:id => location_id)		
	end

	def search_industry industry_id
	    @browser.checkbox(:id => industry_id)
	end

	def industry_toggle
	    @browser.li(:id => "facet-I").button
	end

	def search_loading
		@browser.div(:id => 'srp_main_').class_name == 'loading'
	end

	def search_results index
		results = @browser.ol(:id => 'results').lis(:class => 'mod result')
		length = results.length
		results = results[index..length]
	end

	def name_of_person li
		li.link(:class => 'title').text
	end

	def name_exist? li
		li.link(:class => 'title').exist?
	end

	def description_of_person li
		li.div(:class => 'description').text
	end

	def description_exist? li
		li.div(:class => 'description').exist?
	end

	def blue_button_exists? li
		li.link(:class => 'primary-action-button label').exist?
	end

	def blue_button li
		li.link(:class => 'primary-action-button label')
	end

	def need_email_page?
		@browser.url.start_with?('https://www.linkedin.com/people')
	end

	def next_page
		@browser.li(:class => 'next').link(:class => 'page-link')
	end
end

