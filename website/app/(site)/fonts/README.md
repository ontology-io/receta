# Landing page fonts

Newsreader, cut down from the Latin files Google Fonts serves. The weight axis is pinned at 400, because the landing page uses no other weight. That takes each file from about 135 KB to about 60 KB. The optical size axis stays.

```bash
fonttools varLib.instancer newsreader.woff2 wght=400 --flavor woff2
```

If the page ever needs another serif weight, widen the pin and regenerate. Otherwise the browser fakes the bold.

Newsreader is under the SIL Open Font License 1.1, which also travels in each file's name table.
