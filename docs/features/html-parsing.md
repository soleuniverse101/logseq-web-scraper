TODO (feature in progress)

HTML Parsing is a feature of Logseq Web Scraper used to quickly\* create a structure of Logseq blocks based on the HTML structure of a given website. The typical usecase that I have for this feature is when I'm consuming some structured document (course, book, tutorial, playlist...) and I want to save my progress in Logseq TODO blocks, as well as any comment or note I would have related to a particular section of the document.

\* _at least quicker than manual copy-pasting_

### Example

An image speaks louder than a thousand words, so here is a real example of a use case I had for this feature. I learned C++ using the website [Learn C++](https://www.learncpp.com/). It has quite a long number of chapters, all listed on its first page. Therefore, in order to save my progress through these chapters, and to be able to write notes on details I read in them, I had the following structure in Logseq :

TODO add image

This is a page that can be generated in a few minutes using HTML Parsing, by only writing a parsing query.

_Instead, It took me probably more than 30 minutes to cook up a web scraping function in Javascript which wrote the output I wanted in the page using the Logseq Plugin API..._

TODO add link to parsing query syntax

```
/parse learncpp.com
  list .lessontable
  ` TODO ` .lessontable-header-chapter ` : ` .lessontable-header-title
    list .lessontable-row
      .lessontable-row-number ` : ` .lessontable-row-title
```

The resulting block structure is something like this :

```
Learn C++ – Skill up with our free tutoria
  TODO Chapter 0 :  Introduction / Getting Started
    TODO 0.1 - Introduction to these tutorials
    ...
  ...

```

### More examples

#### Formatting

Selecting elements (divs or spans probably) with class .category-title, and displaying them in a block using the first anchor element found inside :

```
...
  .category-title
  Title : [{a}]({a.href})
```

_You can use the link macro for this by replacing `[{a}]({a.href})` by `{link:a}`_

_(**`{a}` will only evaluate to the content text of the anchor element without its link)**_

TODO add result
