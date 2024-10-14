---
layout: inner
title: SnoTATOS System
permalink: /SnoTATOSsystemDescription/
---

# SnoTATOS: the Snow Thickness And Temperature Observation systems

The Arctic is cold, dark, and hard to get to. To understand how the Arctic ice cover and climate are changing,
we need more frequent and more precise snow measurements than people, planes, and satellites can provide. Autonomous instrumentation
can do the job, but current snow sensing systems are prohibitively expensive and difficult to transport and install. We are trying to change
that with SnoTATOS: an ultra-low power, affordable, distributed snow measurement system. SnoTATOS stations are ~98% less expensive,
92% lighter, and 50% faster to deploy than the current leading polar snow sensing systems,
and with an average power demand of only 224 µA, a SnoTATOS station can achieve a ~2,200 day endurance using a single D-cell battery.

![image](/img/snotatos_system.png)

Each SnoTATOS station is equipped with an ultrasonic rangefinder, and can be installed in a network up to 20 km in diameter.
The stations transmit their data back to a central base station using LoRa radio. The base station
sends all network data home using Iridium SBD. Check out the <a href="/SnoTATOSdata" target="_blank" rel="noopener noreferrer">data page</a>
to see live data from SnoTATOS networks currently deployed in sea ice north of Greenland and Canada!

![image](/img/snotatos_station.png)


<!-- ## Markdown

Text can be **bold**, _italic_, ~~strikethrough~~ or `keyword`.

[Link to another page](/index.html).

There should be whitespace between paragraphs.

# Header 1

This is a normal paragraph following a header. GitHub is a code hosting platform for version control and collaboration. It lets you and others work together on projects from anywhere.

## Header 2

> This is a blockquote following a header.
>
> When something is important enough, you do it even if the odds are not in your favor.

### Header 3

{% highlight js %}
// Javascript code with syntax highlighting.
var fun = function lang(l) {
  dateformat.i18n = require('./lang/' + l)
  return true;
}
{% endhighlight %}

{% highlight ruby %}
# Ruby code with syntax highlighting
GitHubPages::Dependencies.gems.each do |gem, version|
  s.add_dependency(gem, "= #{version}")
end
{% endhighlight %}

#### Header 4

*   This is an unordered list following a header.
*   This is an unordered list following a header.
*   This is an unordered list following a header.

##### Header 5

1.  This is an ordered list following a header.
2.  This is an ordered list following a header.
3.  This is an ordered list following a header.

###### Header 6

| head1        | head two          | three |
|:-------------|:------------------|:------|
| ok           | good swedish fish | nice  |
| out of stock | good and plenty   | nice  |
| ok           | good `oreos`      | hmm   |
| ok           | good `zoute` drop | yumm  |

### There's a horizontal rule below this.

---

### Here is an unordered list:

*   Item foo
*   Item bar
*   Item baz
*   Item zip

### And an ordered list:

1.  Item one
1.  Item two
1.  Item three
1.  Item four

### And a nested list:

- level 1 item
  - level 2 item
  - level 2 item
    - level 3 item
    - level 3 item
- level 1 item
  - level 2 item
  - level 2 item
  - level 2 item
- level 1 item
  - level 2 item
  - level 2 item
- level 1 item

### Wide image

![Branching](https://guides.github.com/activities/hello-world/branching.png)

### Definition lists can be used with HTML syntax.

<dl>
<dt>Name</dt>
<dd>Godzilla</dd>
<dt>Born</dt>
<dd>1952</dd>
<dt>Birthplace</dt>
<dd>Japan</dd>
<dt>Color</dt>
<dd>Green</dd>
</dl>

{% highlight txt %}
Long, single-line code blocks should not wrap. They should horizontally scroll if they are too long. This line should be long enough to demonstrate this.
{% endhighlight %}

{% highlight txt %}
The final element.
{% endhighlight %}

---

## Syntax highlighting

Jekyll has [built in support](https://jekyllrb.com/docs/templates/#code-snippet-highlighting) for syntax highlighting of over 60 languages thanks to [Rouge](http://rouge.jneen.net/).

To render a code block with syntax highlighting, surround your code as follows:

{% highlight markdown %}
{% raw %}
{% highlight ruby %}
def foo
  puts 'foo'
end
{% endhighlight %}
{% endraw %}
{% endhighlight %}

[Pygments](http://pygments.org/) styles are present under section 6.0 of `css/style.scss` for customization.

### Examples

---

#### Bash

{% highlight bash %}
>_ ssh -i ~/.ssh/id_rsa account@host.com
account@host:~$
$ var="my-value"
$ echo $var
my-value
$ logout
{% endhighlight %}

#### HTML

{% highlight html %}
<!DOCTYPE html>
<html>
 <head>
   <meta charset="UTF-8">
   <title>title</title>
 </head>
 <body>

 </body>
</html>
{% endhighlight %}

#### CSS

{% highlight css %}
/*--------------------------------------------------------------
	1.0 Defaults
--------------------------------------------------------------*/

@media (min-width: 1200px) {
  .container {
    width: 1200px;
  }
}

body {
  background-color: #e9edf0;
  @extend %opensans;
  -webkit-font-smoothing: antialiased;
}
{% endhighlight %}

#### YAML

{% highlight yaml %}
### Phantom settings
paginate: 10
footer_text: '© 2018 Jami Gibbs'
admin_name: 'Jami Gibbs'
google_analytics: "UA-9999999-99" # Update with your own tracking ID

#### Phantom Navigation menu
enable_nav: true
nav_item:
  - { url: '/', text: 'Home' }
  - { url: '/about', text: 'About' }
{% endhighlight %} -->
