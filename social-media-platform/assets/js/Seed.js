function seedDemoData() {
  // Only seed once
  if (localStorage.getItem("smp_seeded")) return;
 
  const now = Date.now();
 
  const users = [
    { id:"u_demo1", name:"Layla Hassan",   username:"laylahassan",  email:"layla@pulse.app",   password:"demo123", bio:"Designer & coffee addict ☕ | Building things one pixel at a time", profilePic:"", following:["u_demo2","u_demo3"], timestamp: now - 86400000*30 },
    { id:"u_demo2", name:"Omar Khalid",    username:"omarkhalid",   email:"omar@pulse.app",    password:"demo123", bio:"Full-stack dev 🛠 | Open source | Football fanatic", profilePic:"", following:["u_demo1","u_demo4"], timestamp: now - 86400000*20 },
    { id:"u_demo3", name:"Sara Ahmed",     username:"sara_ahmed",   email:"sara@pulse.app",    password:"demo123", bio:"Photographer 📷 | Traveler | Doha → everywhere", profilePic:"", following:["u_demo1","u_demo2"], timestamp: now - 86400000*15 },
    { id:"u_demo4", name:"Khalid Nasser",  username:"khalidnasser", email:"khalid@pulse.app",  password:"demo123", bio:"CS student at QU | Gaming + AI nerd 🎮", profilePic:"", following:["u_demo2","u_demo3"], timestamp: now - 86400000*10 },
    { id:"u_demo5", name:"Noor Saleh",     username:"noorsaleh",    email:"noor@pulse.app",    password:"demo123", bio:"Marketing & branding | Matcha > coffee 🍵", profilePic:"", following:["u_demo1","u_demo3"], timestamp: now - 86400000*5  },
  ];
 
  const posts = [
    { id:"p_d1",  authorId:"u_demo1", content:"Just redesigned our entire dashboard. Dark mode first — finally! The difference in eye strain is unreal 👁️", timestamp: now - 3600000*2,  expiresAt:null, vibes:{"u_demo2":"🔥","u_demo3":"💯","u_demo4":"🔥"}, comments:[{ id:"c_d1", authorId:"u_demo2", text:"Looks fire 🔥 send the Figma link!", timestamp: now - 3600000 }] },
    { id:"p_d2",  authorId:"u_demo2", content:"Hot take: CSS Grid is more powerful than most people realise. Stop reaching for a framework every time you need a layout 😤", timestamp: now - 3600000*5,  expiresAt:null, vibes:{"u_demo1":"💯","u_demo3":"🫶"}, comments:[{ id:"c_d2", authorId:"u_demo3", text:"Preach!! Tailwind has people forgetting how CSS works lol", timestamp: now - 3600000*4 }] },
    { id:"p_d3",  authorId:"u_demo3", content:"Golden hour in Katara last night was INSANE 🌅 No filter. Just Qatar doing what Qatar does best.", timestamp: now - 3600000*8,  expiresAt:null, vibes:{"u_demo1":"🫶","u_demo2":"👀","u_demo4":"🫶","u_demo5":"🔥"}, comments:[] },
    { id:"p_d4",  authorId:"u_demo4", content:"GPT-5 dropped and somehow my 200-line prompt still returns the same wrong answer lmao 💀💀", timestamp: now - 3600000*12, expiresAt:null, vibes:{"u_demo2":"💀","u_demo3":"💀"}, comments:[{ id:"c_d3", authorId:"u_demo1", text:"the struggle is real 😭", timestamp: now - 3600000*11 }] },
    { id:"p_d5",  authorId:"u_demo5", content:"Matcha latte at 2am while finishing a brand deck. Is this the life I chose? Yes. Do I regret it? Also yes. 🍵", timestamp: now - 3600000*18, expiresAt:null, vibes:{"u_demo1":"😭","u_demo3":"🫶"}, comments:[] },
    { id:"p_d6",  authorId:"u_demo2", content:"Just pushed my first open source project. 3 stars in 10 minutes — I'm basically famous now 🌟", timestamp: now - 86400000,   expiresAt:null, vibes:{"u_demo1":"🔥","u_demo4":"💯","u_demo5":"🫶"}, comments:[{ id:"c_d4", authorId:"u_demo4", text:"followed! great work man", timestamp: now - 86400000 + 3600000 }] },
    { id:"p_d7",  authorId:"u_demo1", content:"Reminder: you don't have to post every day to be relevant. Quality > quantity. Take breaks. Touch grass. 🌿", timestamp: now - 86400000*2, expiresAt:null, vibes:{"u_demo3":"🫶","u_demo5":"💯"}, comments:[] },
    { id:"p_d8",  authorId:"u_demo3", content:"Desert safari weekend trip was everything ✨🐪 highly recommend if you haven't done it yet", timestamp: now - 86400000*3, expiresAt:null, vibes:{"u_demo2":"🔥","u_demo4":"👀"}, comments:[] },
    { id:"p_d9",  authorId:"u_demo4", content:"Studying for finals and my notes look like a conspiracy board at this point 📌📎🧵 send help", timestamp: now - 86400000*4, expiresAt:null, vibes:{"u_demo1":"💀","u_demo2":"💀","u_demo5":"💀"}, comments:[{ id:"c_d5", authorId:"u_demo5", text:"you've got this!! 💪", timestamp: now - 86400000*4 + 7200000 }] },
    { id:"p_d10", authorId:"u_demo5", content:"If your brand doesn't have a voice, it has no pulse. That's the job 🎯 #branding", timestamp: now - 86400000*5, expiresAt:null, vibes:{"u_demo1":"💯","u_demo3":"🔥"}, comments:[] },
  ];
 
  // Save demo data
  const existingUsers = getUsers();
  const existingPosts = getPosts();
 
  // Merge — don't overwrite real accounts
  const allUsers = [...existingUsers, ...users.filter(u => !existingUsers.find(e => e.id === u.id))];
  const allPosts = [...posts, ...existingPosts.filter(p => !posts.find(e => e.id === p.id))];
 
  saveUsers(allUsers);
  savePosts(allPosts);
  localStorage.setItem("smp_seeded", "1");
}
 
seedDemoData();