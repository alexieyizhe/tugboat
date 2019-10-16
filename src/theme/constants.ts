export enum Size {
  XSMALL = "xsmall",
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
  XLARGE = "xlarge",
}

const constants = {
  color: {
    black: "#000000",
    greyDark: "#787878",
    greyMedium: "#C6C6C6",
    greyLight: "#F4F4F4",
    white: "#ffffff",

    greenDark: "#507561",

    error: "#ff6166",
  },
  fontSize: {
    [Size.SMALL]: 14,
    [Size.MEDIUM]: 18,
    [Size.LARGE]: 28,
    [Size.XLARGE]: 34,
  },
  fontFamily: {
    heading:
      'Sharp Sans,Ubuntu,Cantarell,"Helvetica Neue",apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
    body:
      'Roboto,Oxygen-Sans,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
  },
  boxShadow: {
    hover: "0px 10px 25px rgba(50, 50, 50, 0.1)",
  },
  borderRadius: {
    button: 10,
  },
};

export default constants;
