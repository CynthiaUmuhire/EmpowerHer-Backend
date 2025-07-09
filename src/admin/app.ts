import Logo from "./extensions/logo.png";
import favicon from './extensions/favicon.ico';
export default {
  config: {
    head: {
      favicon: favicon,
      title: "EmpowerHer Admin",
      meta: [
        {
          name: "description",
          content: "EmpowerHer Admin Panel",
        },
      ],
    },
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
    translations: {
      en: {
        'Auth.form.welcome.title': 'EmpowerHer Admin Panel',
        'Auth.form.welcome.subtitle': 'Sign in to manage your content',
      }
    },
    tutorials: false,
    notifications: { releases: false },
  },

  bootstrap() { },
};