export const ADSENSE_CONFIG = {
  publisherId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID, // GANTI dengan ID kamu

  slots: {
    // Homepage Slots
    homepageHeroBanner: "3106377852",
    homepageAfterPopular: "6560337826", //multiplex
    homepageAfterEpisodes: "6858245940", //multiplex
    homepageAfterOngoing: "2913924287",
    homepageBottomBanner: "7831209048",

    // Video Player Slots (BARU - ganti dengan slot ID kamu)
    playerAboveVideo: "2340091092", // Above video player
    playerBelowVideos: "7979755921", // multiplex
    playerAfterNav: "1414347578", // multiiplex
    playerAfterEpisodeList: "9859488464", // After episode list
    playerBottomBanner: "8096132039", // Bottom banner

    // Drama Detail Slots (BARU - ganti dengan slot ID kamu)
    dramaAfterHero: "7728413447", // After hero/thumbnail
    dramaAfterSynopsis: "2750753626", //multiplex
    dramaAfterEpisodes: "3391042176", // After episode list
    dramaAfterRelated: "3789168436", // After related dramas
    dramaBottomBanner: "8279572623", // Bottom banner
  },

  // Layout keys untuk in-feed ads (dari AdSense dashboard)
  layoutKeys: {
    homepageInFeed: "-6t+ed+2i-1n-4w",
  },
};
