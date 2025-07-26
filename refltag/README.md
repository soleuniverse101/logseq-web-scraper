# REFLTag

A web scraping DSL (Domain-specific language) designed specifically for the [Logseq Web Scraping Plugin](../) with a focus on direct output formatting. REFLTag and by extension Web Parsing with this extension strives to be what you replace mindless website copy pasting with, precisely, being the most useful when you're extracting info from a website, and writing it in blocks or a page, with a maybe slightly different format.

Here is an example of a REFLTag request :

```
parse https://www.google.com
The page's title is {title} and its first input button is {input}.

# Result
The page's title is Google and its first input button is {Google Search}.
```

## Credits

- [Crafting Interpreters](https://craftinginterpreters.com/) : I was first introduced to the creation (design, parsing and interpretation) of programming languages by the incredible book Crafting Interpreters. Check it out if you're interested in this domain but have no idea how to get into it !

- [Scrapelect](https://github.com/suaviloquence/scrapelect/) : While looking for similar projects, I found out about Scrapelect which is very similar to what I wanted to create, but it missed some features I needed, mainly the ability to format text to its final, user-readable state. Still, it represents valuable input, and I was particularly inspired by its simple syntax, something I noticed missing from the popular web scraping DSLs already available.
