# Ternary plot maker

The source code for my side project: [TernaryPlot.com](http://www.ternaryplot.com). A single purpose website to quickly and freely genreate ternary plots. A ternary plot is a somewhat obscure diagram often used in geology, soil sciences, metallurgy and chemical engineering. The quickest option available for makint ternary plots was with Excel templates, which in my opinion are inflexible and produce ugly plots. Some R and Python libraries exist for this purpose but these are harder to use and require installing R and Python (of course). That's why I made a tool for personal use, and later decided to develop into something slicker and with more options.

Feel free to contact me if you have any questions or comments.

## To-do

1. !Figure out how to decrease bundle size
2. Use HandsOnTable validators
2. Clean up code and split main.js into multiple files, use less global variables
2. Lock columns titles and use columns properties in HandsOnTable
2. Update to d3-ternary to d3 v5 and import only necessary modules
3. Bundle CSS / webpack
4. Use HandsOnTable localStorage / persistant state
4. Use cookie to not show pop-up and don't show sample data on repeat visits
3. Bring drawn points to front if areas are plotted over them https://codepen.io/osublake/pen/YXoEQe 
4. Clean explain page code
2. Make option to add rows


## Libraries used

* Daven Quinn's [D3-ternary](https://github.com/davenquinn/d3-ternary)
* [D3 v3](https://d3js.org/)
* [SVG Crowbar](https://github.com/NYTimes/svg-crowbar)
* [Sweet Alert](https://sweetalert.js.org/)
* [HandsOnTable](https://handsontable.com/)
