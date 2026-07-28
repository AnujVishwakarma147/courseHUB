import arcjet, {
  shield,
} from "@arcjet/next";

export default arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["fingerprint"],

  //define base rules here, can also be empty if you want to use base rules
  rules: [
    shield({
      mode: "LIVE",
    }),
  ],
});
