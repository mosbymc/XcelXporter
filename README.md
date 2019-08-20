# XcelXporter
A JavaScript library for creating excel workbooks based on a collection of objects

I am currently working on the first draft of this functionality for my [HTML grid widget](https://github.com/mosbymc/HTML-Data-Grid-Widget). Once the basic functionality is in place, I'll begin really working on adding to this repo.

I have committed a basic working version of the excel exporter to the develop branch. There's nothing fancy going on yet; it'll take an array of JSON data and an optional collection of column names and a name for the worksheet as a string.

Currently you can really only have a single worksheet in the entire workbook, but I hope to change that soon. I also plan on adding themes, styling, and more supported excel items, like charts, images, etc.

To export your JSON data as an excel file, include the excelExporter.js file on your page.

Then call the 'createWorkBook' function off the exporter object thusly:
```javascript
  var wb = excelExporter.createWorkBook();
```

This will initialize a workbook instance and allow you to add a worksheet. To add a work sheet to the workbook instance, you must have an array of JSON data. The collection of columns and the sheet name are optional. To add a worksheet, call the 'createWorkSheet' function on the workbook instance, passing in the your JSON data, and optional column definitions and worksheet name, thusly:
```javascript
  wb.createWorkSheet(data, columns, 'sheetname');
```
When you're ready to export the data as a .xlsx file, feed the workbook instance to the exporter's 'exportWorkBook' function like so:
```javascript
  excelExporter.exportWorkBook(wb);
```

As I said, there's currently not much to this functionality, but as I work on my grid widget I will continue to add to this repo. If I ever get to a stopping point with the [grid](https://github.com/mosbymc/HTML-Data-Grid-Widget) (not likely; do you have any idea how much functionality you can throw in a grid widget!!!), then I begin focusing more on this repository.

Also, I'd like to give credit and say thank you to the creator of [this excel exporter](http://excelbuilderjs.com/). I have temporarily jacked a couple of helper functions until I have time to better suite their functionality to my needs. Also, this exporter gave me a few high-level design ideas.
