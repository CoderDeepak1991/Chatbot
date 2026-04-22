<div id="chatbot-widget" style="border:1px solid #ccc; width:300px; height:400px; display:flex; flex-direction:column; font-family:Arial, sans-serif;">
  <div id="chat-log" style="flex:1; padding:10px; overflow-y:auto; background:#f9f9f9;"></div>
  <div style="display:flex; border-top:1px solid #ccc;">
    <input id="chat-input" type="text" placeholder="Type your question..." 
 style="flex:1; padding:8px; border:none; outline:none;" 
 onkeypress="if(event.key===&#39;Enter&#39;){searchPosts();}" />
    <button onclick="searchPosts()" style="padding:8px; border:none; background:#0078d7; color:white; cursor:pointer;">Send</button>
  </div>
</div>

<script>
async function loadFeed() {
  const url = "https://lte-beginners.blogspot.com/feeds/posts/default?alt=atom"; 
  const response = await fetch(url);
  const text = await response.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, "application/xml");

  const items = xml.querySelectorAll("entry");
  let posts = [];
  items.forEach(item => {
    const title = item.querySelector("title")?.textContent || "";
    const link = item.querySelector("link")?.getAttribute("href") || "";
    let content = item.querySelector("content")?.textContent || item.querySelector("summary")?.textContent || "";
    content = content.replace(/<[^>]+>/g, " "); // strip HTML
    posts.push({ title, link, content });
  });
  return posts;
}

let cachedPosts = [];
loadFeed().then(posts => cachedPosts = posts);

function addMessage(sender, text, isUser=false) {
  const log = document.getElementById("chat-log");
  const bubble = document.createElement("div");
  bubble.style.margin = "5px 0";
  bubble.style.padding = "8px";
  bubble.style.borderRadius = "10px";
  bubble.style.maxWidth = "80%";
  bubble.style.wordWrap = "break-word";
  bubble.style.background = isUser ? "#0078d7" : "#e5e5ea";
  bubble.style.color = isUser ? "white" : "black";
  bubble.style.alignSelf = isUser ? "flex-end" : "flex-start";
  bubble.innerHTML = `<b>${sender}:</b> ${text}`;
  log.appendChild(bubble);
  log.scrollTop = log.scrollHeight;
}

function searchPosts() {
  const inputEl = document.getElementById("chat-input");
  let query = inputEl.value.toLowerCase().trim();
  if (!query) return;
  addMessage("You", query, true);

  // Remove punctuation (question marks, full stops, commas, etc.)
  query = query.replace(/[?.!,]/g, "");

  // Define stopwords to ignore
  const stopwords = ["what","how","where","when","why","is","the","a","an","of","in","on","to","for","with","and","or"];

  // Break query into keywords, filter out stopwords
  const keywords = query.split(/\s+/).filter(k => k.length > 2 && !stopwords.includes(k));

  // Score posts by keyword matches
  const scored = cachedPosts.map(p => {
    const text = (p.title + " " + p.content).toLowerCase();
    let score = 0;
    keywords.forEach(k => { if (text.includes(k)) score++; });
    return { ...p, score };
  }).filter(p => p.score > 0);

  // Sort by score (highest first)
  scored.sort((a,b) => b.score - a.score);

  if (scored.length > 0) {
    scored.slice(0,3).forEach(r => {
      const snippet = r.content.substring(0,150);
      addMessage("Bot", `Found: <a href="${r.link}" target="_blank">${r.title}</a><br>${snippet}...`);
    });
  } else {
    addMessage("Bot", "Sorry, I couldn’t find any matching posts.");
  }

  inputEl.value = "";
}
</script>