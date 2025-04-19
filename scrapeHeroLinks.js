import axios from "axios";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const cheerio = require("cheerio");
import fs from "fs";

const BASE_URL = "https://mobile-legends.fandom.com";

async function scrapeHeroLinks() {
  const { data } = await axios.get(`${BASE_URL}/wiki/List_of_heroes`);
  const $ = cheerio.load(data);
  const links = [];

  $("table.wikitable tbody tr td:nth-child(1) a").each((_, el) => {
    const name = $(el).text().trim();
    const href = $(el).attr("href");
    if (href && href.startsWith("/wiki/")) {
      links.push({ name, url: BASE_URL + href });
    }
  });

  fs.writeFileSync("hero_links.json", JSON.stringify(links, null, 2));
  console.log(`✅ Saved ${links.length} hero links`);
}

scrapeHeroLinks();
