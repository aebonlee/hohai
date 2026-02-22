var run = async function() {
  var prevH = 0;
  var i;
  for (i = 0; i < 80; i++) {
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise(function(r) { setTimeout(r, 1500); });
    if (document.body.scrollHeight === prevH) break;
    prevH = document.body.scrollHeight;
    console.log("scroll " + (i + 1));
  }
  window.scrollTo(0, 0);
  var links = document.querySelectorAll('a[href*="/song/"]');
  var seen = {};
  var songs = [];
  links.forEach(function(a) {
    var href = a.getAttribute("href") || "";
    var m = href.match(/\/song\/([a-f0-9-]+)/);
    if (!m || seen[m[1]]) return;
    seen[m[1]] = true;
    var p = a.closest("div") || a.parentElement;
    var t = p ? p.innerText.split("\n")[0] : "";
    songs.push({ id: m[1], title: t || "untitled", url: "https://suno.com/song/" + m[1] });
  });
  console.log("found " + songs.length + " songs");
  if (songs.length > 0) {
    var blob = new Blob([JSON.stringify(songs, null, 2)], { type: "application/json" });
    var el = document.createElement("a");
    el.href = URL.createObjectURL(blob);
    el.download = "suno_songs.json";
    el.click();
  } else {
    console.log("no songs found");
    console.log("all links: " + document.querySelectorAll("a").length);
    console.log("song links: " + document.querySelectorAll('a[href*="song"]').length);
  }
};
run();
