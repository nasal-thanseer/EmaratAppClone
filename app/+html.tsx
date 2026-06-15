import { ScrollViewStyleReset } from "expo-router/html";
import { PropsWithChildren } from "react";

export default function RootHtml({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#113C35" />
        <meta
          name="description"
          content="Nawa Rewards is a secure loyalty and rewards experience for members and participating merchants."
        />
        <title>Nawa Rewards</title>
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
