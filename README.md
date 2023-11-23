# API for Prisoners of Hostage Exchange Deal

This is a skeleton code for some statistical analysis on the 300 prisoners that will soon be released in the hostage exhange deal.

## How to Use
This code provides a minimal and clean API for some basic analysis, as well as the grounds to add any analysis of your own.
Here are some utility methods that you can use:

- `fetchPrisoners` - returns a batch of 20 prisoners on every iteration
- `collectAllPrisoners` - returns an extensive list of all the prisoners in the database (300 in total)
- `analyseFieldsOfInterest` - returns an object that contains a set of all the possible different values of the given fields
- `getArrestsAfterDate` - returns the list of prisoners that were arrested during or after a given date
- `getPercentages` - returns an object with all the possible values of the given field, and the percentage of each value
- `getCorrelation` - returns the correlation between two given fields, based on the Pearson correlation coefficient formula