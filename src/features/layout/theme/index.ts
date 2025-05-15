import { extendTheme } from "@chakra-ui/react";
import { getStyleObjectFromString } from "utils/string";
import { breakpoints } from "./breakpoints";
import { rainbowTextCss } from "./css";

const theme = extendTheme({
  breakpoints,
  colors: {
    black: "#16161D"
    // brown: {
    //   50: "#c6b7a2",
    //   100: "#442727"
    // },
    //white: "#F7FAFC"
    //white: "#FFFAF0" // orange.50
    //white: "#F4F4D8"
  },

  config: { initialColorMode: "light" },
  components: {
    Badge: {
      baseStyle: { textTransform: "none" }
    },
    // https://stackoverflow.com/questions/68531930/style-chakra-ui-formcontrol-and-label-at-application-theme-level
    Form: {
      // The styles all button have in common
      parts: ["container"],
      baseStyle: {
        /// The container styles the FormControl
        container: {
          display: "flex",
          flexDirection: "column"
        }
      }
    },
    FormLabel: {
      baseStyle: {
        fontFamily: `'Roboto', sans-serif`,
        fontWeight: "bold"
        //...getStyleObjectFromString(rainbowTextCss(false)),
        //".chakra-ui-dark &": getStyleObjectFromString(rainbowTextCss(true))
      }
    },
    Input: {
      // baseStyle: {
      //   field: {
      //     backgroundColor: "gray.100"
      //   }
      // },
      variants: {
        /**
         * Input component will use "outline" styles by default.
         * Styles set here will override anything in { baseStyle } and { sizes }
         */
        outline: {
          field: {
            ".chakra-ui-light &": {
              background: "white",
              border: "1px solid",
              borderColor: "inherit",
              _focus: {
                zIndex: 1,
                borderColor: "#3182ce",
                boxShadow: "0 0 0 1px #3182ce"
              },
              _hover: { borderColor: "gray.300" }
            },
            ".chakra-ui-dark &": {
              //backgroundColor: "#9EA4AF",
              backgroundColor: "#677080",
              "::placeholder": { color: "white" }
            }
          }
        },
        filled: {
          field: {
            ".chakra-ui-light &": {
              background: "gray.100",
              border: "2px solid",
              borderColor: "transparent",
              _focus: {
                background: "transparent",
                borderColor: "#3182ce"
              },
              _hover: {
                background: "gray.300"
              }
            },
            ".chakra-ui-dark &": {
              background: "yellow"
            }
          }
        },
        flushed: {
          field: {
            ".chakra-ui-light &": {
              background: "transparent",
              borderBottom: "1px solid",
              borderColor: "inherit",
              borderRadius: 0,
              paddingX: 0,
              _focus: {
                borderColor: "#3182ce",
                boxShadow: "0 0 0 1px #3182ce"
              }
            },
            ".chakra-ui-dark &": {
              background: "green"
            }
          }
        },
        unstyled: {
          field: {
            ".chakra-ui-light &": {
              background: "transparent",
              borderRadius: "md",
              height: "auto",
              paddingX: 0
            },
            ".chakra-ui-dark &": {
              background: "transparent",
              borderRadius: "md",
              height: "auto",
              paddingX: 0
            }
          }
        }
      },
      defaultProps: {
        /**
         * Set either or both of these to null to use only what's in { baseStyle }
         */
        size: "md",
        variant: "outline"
      }
    },
    Link: {
      baseStyle: {
        transitionProperty: "common",
        transitionDuration: "fast",
        transitionTimingFunction: "ease-out",
        cursor: "pointer",
        textDecoration: "none",
        outline: "none",
        color: "inherit",
        _hover: {
          textDecoration: "none"
        },
        _focus: {
          boxShadow: "outline"
        }
      },
      sizes: {
        smaller: {
          fontSize: "smaller"
        },
        larger: {
          fontSize: "2xl",
          fontWeight: "bold"
        }
      },
      variants: {
        underline: {
          textDecoration: "underline"
        }
      }
    },
    Select: {
      baseStyle: {
        field: {
          backgroundColor: "white",
          ".chakra-ui-dark &": {
            backgroundColor: "whiteAlpha.300"
          }
        }
      }
    },
    Spacer: {
      baseStyle: {
        border: "1px solid orange.300 !important",
        ".chakra-ui-dark &": {
          border: "1px solid white !important"
        }
      }
    }
  },
  fonts: {
    mono: `monospace`,
    roboto: `'Roboto', sans-serif`,
    spectral: `-apple-system-ui-serif, ui-serif, Spectral, Georgia, serif`
  }
});

export * from "./breakpoints";
export * from "./css";
export * from "./size";
export default theme;
