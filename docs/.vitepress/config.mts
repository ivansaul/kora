import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "codexy",
  description: "codexy description",
  themeConfig: {
    search: {
      provider: "local",
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Examples", link: "/markdown-examples" },
    ],

    sidebar: [
      {
        text: "Examples",
        items: [
          { text: "Markdown Examples", link: "/markdown-examples" },
          { text: "Runtime API Examples", link: "/api-examples" },
          { text: "Functions", link: "/functions" },
        ],
      },
      {
        text: "Reference",
        items: [
          {
            text: "Swift",
            items: [
              { text: "Functions", link: "/reference/swift/functions" },
              {
                text: "Dictionaries",
                link: "/reference/swift/dictionaries",
              },
            ],
          },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/ivansaul/codexy" },
      { icon: "discord", link: "https://discord.gg/tDvybtJ7y9" },
    ],
    footer: {
      message: "Released under the GPL License.",
      copyright: "Copyright © 2026 ivansaul",
    },
  },
  head: [
    [
      "style",
      {},
      `
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap');
          `,
    ],
    [
      "style",
      {},
      `
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap');
          `,
    ],
    ["link", { rel: "stylesheet", href: "/styles/codapi.css" }],
    ["script", { src: "/scripts/codapi.js" }],
  ],
});
