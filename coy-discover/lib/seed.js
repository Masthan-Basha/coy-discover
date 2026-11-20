// Deterministic mock data. `likesMe` is server-side only and is never sent to the client.
const PEOPLE = [
  ['Aarav', 21, 'IIT Madras', 'Chai over coffee, always. Will beat you at chess.', ['Chess', 'Running', 'Indie music']],
  ['Diya', 20, 'Chennai', 'Bookstore wanderer. Ask me about my last three reads.', ['Books', 'Poetry', 'Filter coffee']],
  ['Kabir', 22, 'BITS Pilani', 'Builds side projects at 2am and ships about half.', ['Coding', 'Football', 'Startups']],
  ['Meera', 19, 'Bengaluru', 'Sketchbook in my bag, paint on my jeans.', ['Illustration', 'Cafes', 'Thrifting']],
  ['Rohan', 23, 'Hyderabad', 'Weekend trekker. Biryani is a personality trait.', ['Trekking', 'Food', 'Photography']],
  ['Ananya', 21, 'Christ University', 'Debate team captain. Yes, I will win this argument.', ['Debate', 'Theatre', 'Podcasts']],
  ['Vihaan', 22, 'NIT Trichy', 'Guitar, gym, and group projects I somehow lead.', ['Guitar', 'Gym', 'Cricket']],
  ['Ishita', 20, 'Pune', 'Classical dancer who also loves heavy metal.', ['Kathak', 'Metal', 'Baking']],
  ['Arjun', 24, 'Mumbai', 'Stand-up open mic regular. Mostly laughing at myself.', ['Comedy', 'Movies', 'Cycling']],
  ['Saanvi', 21, 'VIT Vellore', 'Plant parent to 14 and counting.', ['Plants', 'Yoga', 'Journaling']],
  ['Reyansh', 22, 'IIIT Hyderabad', 'ML by day, lo-fi playlists by night.', ['AI', 'Lo-fi', 'Board games']],
  ['Kiara', 19, 'Delhi', 'Always planning the next trip, rarely taking it.', ['Travel', 'Fashion', 'Dance']],
  ['Aditya', 23, 'Manipal', 'Marathon in progress. Ask me about pacing.', ['Running', 'Nutrition', 'Documentaries']],
  ['Navya', 20, 'Tirupati', 'Carnatic singer, terrible at texting back.', ['Carnatic music', 'Temples', 'Sketching']],
  ['Ishaan', 21, 'IIM Bangalore', 'Cold brew, cold emails, warm handshakes.', ['Finance', 'Tennis', 'Reading']],
  ['Tara', 22, 'Goa', 'Surf instructor trying to look like a grown-up.', ['Surfing', 'Sunsets', 'Vinyl']],
  ['Dev', 20, 'SRM Chennai', 'Gamer with a social life, allegedly.', ['Gaming', 'Anime', 'Street food']],
  ['Pooja', 23, 'Kochi', 'Marine biology nerd. The ocean is my office.', ['Diving', 'Science', 'Seafood']],
  ['Nikhil', 22, 'Jaipur', 'Photographer chasing golden hour.', ['Photography', 'Road trips', 'Chai']],
  ['Riya', 21, 'Kolkata', 'Adda, rolls, and rainy-day playlists.', ['Writing', 'Football', 'Film']],
  ['Siddharth', 24, 'Ahmedabad', 'Startup founder who still sleeps eight hours.', ['Startups', 'Squash', 'Podcasts']],
  ['Aisha', 20, 'Hyderabad', 'Baker of questionable but delicious things.', ['Baking', 'K-dramas', 'Painting']],
  ['Karthik', 23, 'Coimbatore', 'Bike mechanic, weekend DJ.', ['Bikes', 'DJing', 'Coffee']],
  ['Zoya', 21, 'Lucknow', 'Poetry nights and chaat runs.', ['Poetry', 'Chaat', 'Theatre']],
  ['Harsh', 22, 'IIT Bombay', 'Robotics club, and yes it is as fun as it sounds.', ['Robotics', 'Badminton', 'Sci-fi']],
  ['Myra', 19, 'Chandigarh', 'Dog person. Will show you 400 photos of my dog.', ['Dogs', 'Hiking', 'Baking']],
  ['Yash', 25, 'Bengaluru', 'Product designer who judges your fonts.', ['Design', 'Typography', 'Jazz']],
  ['Lavanya', 20, 'Vizag', 'Beach walks, bad puns, great playlists.', ['Beaches', 'Puns', 'Music']],
  ['Rahul', 23, 'Anna University', 'Quiet until you mention cricket stats.', ['Cricket', 'Stats', 'Tea']],
  ['Tanvi', 22, 'Mumbai', 'Runs a tiny zine press out of her dorm.', ['Zines', 'Printmaking', 'Thrifting']],
  ['Neel', 21, 'Pune', 'Rock climbing, rock music, rock-solid at napping.', ['Climbing', 'Rock', 'Naps']],
  ['Sneha', 24, 'Chennai', 'Doctor in training, night owl by necessity.', ['Medicine', 'Baking', 'Binge-watching']],
];

// Small seeded PRNG so every fresh install gets the same data.
function rng(seed) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

function photo(name, hue) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 560'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='hsl(${hue},68%,64%)'/><stop offset='1' stop-color='hsl(${(hue + 55) % 360},60%,34%)'/></linearGradient></defs><rect width='400' height='560' fill='url(#g)'/><circle cx='200' cy='215' r='72' fill='rgba(255,255,255,.4)'/><ellipse cx='200' cy='440' rx='135' ry='115' fill='rgba(255,255,255,.4)'/></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export function buildProfiles() {
  const rand = rng(42);
  const profiles = PEOPLE.map(([name, age, place, bio, interests], i) => ({
    id: `p${String(i + 1).padStart(2, '0')}`,
    name, age, place, bio, interests,
    photo: photo(name, Math.floor(rand() * 360)),
    // ~1 in 3 profiles already liked the logged-in user (kept server-side only).
    likesMe: i % 3 === 1 || i === 0,
  }));
  // Shuffle so the feed order carries no hint about who liked the user.
  for (let i = profiles.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [profiles[i], profiles[j]] = [profiles[j], profiles[i]];
  }
  return profiles;
}
