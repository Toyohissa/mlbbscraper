import { createRequire } from "module";
const require = createRequire(import.meta.url);
import axios from "axios";
import fs from "fs/promises";
const cheerio = require("cheerio");

const baseUrl = "https://mobile-legends.fandom.com";
const listUrl = `${baseUrl}/wiki/List_of_heroes`;

async function getHeroInfo(heroUrl) {
  try {
    const { data } = await axios.get(heroUrl);
    const $ = cheerio.load(data);
    console.log($);

    const info = {};

    $(".portable-infobox .pi-item").each((_, el) => {
      const label = $(el).find(".pi-data-label").text().trim().toLowerCase();
      const value = $(el).find(".pi-data-value").text().trim();

      if (label && value) {
        info[label] = value;
      }
    });

    return info;
  } catch (err) {
    console.error("Error fetching hero info from:", heroUrl);
    return {};
  }
}

async function scrapeHeroes() {
  try {
    const linksData = await fs.readFile("hero_links.json", "utf-8");
    const links = JSON.parse(linksData);
    const heroes = [];

    for (const { name, url } of links) {
      const heroName = name || url.split("/").pop();

      console.log(`Scraping info for ${heroName} from ${url}`);

      const extraInfo = await getHeroInfo(url);
      const img = extraInfo.image || null;
      (extraInfo.role = extraInfo.role.split("/").map((s) => s.trim())),
        (extraInfo["lane recc."] = extraInfo["lane recc."]
          .split("/")
          .map((s) => s.trim())),
        heroes.push({
          Name: heroName,
          Image: img,
          ...extraInfo,
        });

      console.log(`Processed ${heroName}`);
    }

    await fs.writeFile(
      "mlbb_heroes_full_info.json",
      JSON.stringify(heroes, null, 2)
    );
    console.log(`Finished scraping ${heroes.length} heroes with full info.`);
  } catch (error) {
    console.error("Error scraping heroes:", error.message);
  }
}

scrapeHeroes();
