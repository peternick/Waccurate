API file data format:
	12hr_forecast_data - 2 main keys throughout whole dictionary in order: data collection at 9pm of one day and data collection at 9am of the next
		{date_time (year_month_day_hr): {state : {state_code_for_api: {hour: api_data}}}} 			

	24hr_historical_data - 1 main key throughout whole dictionary: 24hr historical data from 9am of the 12hr forecast