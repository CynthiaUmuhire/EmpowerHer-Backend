import Logo from "./extensions/logo.png";
export default {
  config: {
    auth: {
      logo: Logo,
    },
    menu: {
      logo: Logo,
    },
    theme: {
      light: {
        colors: {
          primary100: "#EBF1FE",
          primary200: "#bbcffb",
          primary500: "#78a9f8",
          primary600: "#1f60a6",
          primary700: "#113E6F",
          danger700: "#b72b1a",
        },
      },
    },
    // Extend the translations
    translations: {
      fr: {
        "Auth.form.email.label": "test",
        Users: "Utilisateurs",
        City: "CITY (FRENCH)",
        // Customize the label of the Content Manager table.
        Id: "ID french",
      },
    },
    // Disable video tutorials
    tutorials: false,
    // Disable notifications about new Strapi releases
    notifications: { releases: false },
  },

  bootstrap() { },
};