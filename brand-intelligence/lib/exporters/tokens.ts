interface ColourToken {
  name: string;
  hex: string;
  rgb?: { r: number; g: number; b: number };
}

interface TypographyToken {
  name: string;
  role: string;
  weights: string[];
  fallbackStack?: string;
}

interface MotionToken {
  easingCurves?: Record<string, string>;
  durationTokens?: Record<string, string>;
}

export function generateCSSTokens(
  colours: ColourToken[],
  typography: TypographyToken[],
  motion?: MotionToken
): string {
  const colourVars = colours
    .map((c) => {
      const varName = `--color-${c.name.toLowerCase().replace(/\s+/g, "-")}`;
      const rgbVar = c.rgb
        ? `\n  ${varName}-rgb: ${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b};`
        : "";
      return `  ${varName}: ${c.hex};${rgbVar}`;
    })
    .join("\n");

  const typographyVars = typography
    .map((t) => {
      const varName = `--font-${t.role.toLowerCase()}`;
      const familyValue = t.fallbackStack ?? `"${t.name}", sans-serif`;
      return `  ${varName}: ${familyValue};`;
    })
    .join("\n");

  const easingVars = motion?.easingCurves
    ? Object.entries(motion.easingCurves)
        .map(([k, v]) => `  --ease-${k}: ${v};`)
        .join("\n")
    : "";

  const durationVars = motion?.durationTokens
    ? Object.entries(motion.durationTokens)
        .map(([k, v]) => `  --duration-${k}: ${v};`)
        .join("\n")
    : "";

  return `:root {
/* Colours */
${colourVars}

/* Typography */
${typographyVars}

/* Motion */
${easingVars}
${durationVars}
}`;
}

export function generateJSONTokens(
  colours: ColourToken[],
  typography: TypographyToken[],
  motion?: MotionToken
): Record<string, unknown> {
  return {
    color: Object.fromEntries(
      colours.map((c) => [
        c.name.toLowerCase().replace(/\s+/g, "-"),
        {
          value: c.hex,
          type: "color",
          ...(c.rgb && { rgb: `rgb(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})` }),
        },
      ])
    ),
    font: Object.fromEntries(
      typography.map((t) => [
        t.role.toLowerCase(),
        {
          family: { value: t.name, type: "fontFamily" },
          weights: t.weights,
        },
      ])
    ),
    motion: {
      easing: motion?.easingCurves ?? {},
      duration: motion?.durationTokens ?? {},
    },
  };
}

export function generateFigmaTokens(
  colours: ColourToken[]
): Record<string, unknown> {
  return {
    global: {
      ...Object.fromEntries(
        colours.map((c) => [
          c.name,
          {
            value: c.hex,
            type: "color",
          },
        ])
      ),
    },
  };
}
