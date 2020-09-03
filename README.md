# Waccurate
 A desktop application using HTML, CSS, Javascript, Bootstrap, and NodeJs that shows how accurate Accuweather's forecasts are based on different variables.
<img src="public/media/pictures/Waccurate title.png">

<h2>Overview</h2>
The purpose of Waccurate is for users to be able to observe how accurate Accuweather's predictions are in their general area. Waccurate allows
seeing the percentage accuracy of an Accuweather forecast of up to and including 12 hours. This site is not finished, as some more functionality
that still needs to be included is:
<ul>
 <li>Refactoring the interactive map of the United States so that it is responsive to the viewport size. As of now it breaks if that happens</li>
 <li>Icon images hovering above each state on the interactive map giving a graphical and numerical representation of the current temperature in the capital of each state</li>
 <li>Adding an animation so that when a user clicks the calculate button after giving their input, a lightning strike comes from the animated clouds</li>
 <li>Displaying more information about a state's weather if clicked on from the interactive map</li>
 <li>Making the cities of each state clickable once a user clicks on a state in the interactive map</li>
</ul>

Those are just a few of the more major things I would like to get to at some point.

The weather data I used for this map comes from the Accuweather API and was collected over a one month period. That means the results that are displayed once 
a user gives appropriate inputs to the program <b>Are not completely accurate</b>. To collect enough data to make the percentage accuracy predictions
given by the program plausible would take a lot of money (The Accuweather API costs money) and time (since I had to manually run my program everyday at a specific 
time in order to keep my data organized). The data is stored in text files in the form of JSON objects. The raw data retrieved from the Accuweather API had its own JSON 
format, which I had modified so that my program could read the data more efficiently and so that redundant data was omitted. 
