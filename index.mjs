import got from 'got';
import bookmarks from './bookmarks.json' assert { type: 'json' };

const user = process.env.USER;
const key = process.env.KEY;
const url = `https://${user}.historio.us/api`;
const agent = `${user} import script`;
const collection = [];

function collect(children, tags = new Set()) {
  for (const child of children) {
    if (child.typeCode === 1) {
      collection.push({
        url: child.uri,
        title: child.title,
        tags: [...tags].join(', '),
      },);
    } else if (child.typeCode === 2) {
      const childTags = new Set(tags);
      childTags.add(child.title.replace(/ /g, '-').toLowerCase());

      collect(child.children, childTags);
    }
  }
}

collect(bookmarks.children);

console.log(`${collection.length} bookmarks collected`);

for (const bookmark of collection) {
  // await timer(500);
  await new Promise((res) => setTimeout(res, 1200));
  console.log(`Adding "${bookmark.title}"...`);

  const response = await got.post(
    `${url}/add`,
    {
      form: {
        agent,
        ...bookmark,
      },
      searchParams: { key },
    },
  ).json();

  console.log(response == '0' ? '✅' : `⛔️ ${response}`);
}
