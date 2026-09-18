# Sneaks — Website Project

## Student Information
- **Name:** Nhlakanipho Bhengu
- **Student Number:** ST10538008
- **Subject:** Web Development (WEDE5020)
- **Institution:** The IIE Rosebank College

## Project Overview
Sneaks is a sneaker resale store based in Durban, specialising in rare,
limited-edition and pre-owned sneakers for collectors and streetwear enthusiasts. This
project is a three-part Portfolio of Evidence building a fully functional, responsive,
and SEO-optimised website for the business, progressing from HTML structure (Part 1),
to CSS styling (Part 2), to JavaScript functionality and SEO (Part 3).

## Website Goals and Objectives
- Showcase current stock so customers don't need to message first to see what's available
- Generate reservation and purchase enquiries
- Build trust through a clearly communicated authenticity guarantee

## Key Features and Functionality
- 5-page site: Home, About Us, Products, Enquiry, Contact
- Product listings with size, condition and price
- Reserve/offer/request enquiry form
- Contact page with two locations (main store + weekend pop-up), each with an
  embedded Google Map and a contact form
- Fully responsive layout across desktop, tablet and mobile
- Clickable logo linking back to the homepage from every page

## Timeline and Milestones
- **Part 1:** Planning, content research, HTML structure — complete
- **Part 2:** CSS styling and responsive design — complete
- **Part 3:** JavaScript functionality and SEO optimisation — upcoming

## Sitemap
```
Home (index.html)
│
├── About Us (about.html)
│ Our story, authenticity guarantee, mission and vision
│
├── Products (products.html)
│ Current stock: product name, size, condition and price
│
├── Enquiry (enquiry.html)
│ Reserve a pair, make an offer, or request a specific model/size
│
└── Contact (contact.html)
Store locations (with embedded maps), phone/email, contact form
```


Every page is reachable from every other page through the navigation menu in the
header (not just from the homepage), so the site's actual link structure is a full
mesh rather than a strict parent-child hierarchy. The diagram above shows the
sitemap's logical grouping under Home for planning purposes.

## Part 1 Details — HTML Structure

All five pages were built using semantic HTML5 elements (`header`, `nav`, `main`,
`section`, `article`, `figure`, `footer`) rather than generic `div` elements.
Product images are paired with their names using `figure` and `figcaption`, which
ties each photograph to its caption directly in the markup.

## Part 2 Details — CSS Styling and Responsive Design

### External stylesheet
A single external stylesheet, `css/style.css`, is linked from every page, so one
change updates the whole site at once.

### Colour and typography
- Colour scheme: black, white and blue (the brand palette from the Website Project
  Proposal), written as plain named CSS colours (e.g. `blue`, `black`, `dimgray`)
  rather than hex codes, for readability.
- Typography uses the system font stack (`Arial, Helvetica, sans-serif`) throughout,
  so the site needs no externally loaded fonts or third-party font service.

### Layout
CSS Grid is used for the hero, the About page story section, the Mission/Vision
pair, the "What We Offer" cards, the product grid and the two contact locations.
Flexbox is used for the header, the navigation menu and the stacked form fields.

### Interactive states
`:hover` and `:focus` are used on buttons, links and form fields so the site
responds visibly to both mouse and keyboard use.

### Responsive design
Two breakpoints — 1024px (tablet) and 600px (mobile) — collapse multi-column
layouts to a single column and restyle the header/navigation for small screens.
Spacing and font sizes use relative units (`rem`, `%`).

### Responsive images
`srcset` and `sizes` were added to the homepage hero image, the About page photo,
and all four product images, so a phone downloads a smaller 480px file instead of
the full-size original.

### Embedded maps
Both Contact page locations use an embedded Google Map (a plain `iframe`, the same
technique used to embed a YouTube video — no API key or JavaScript required).

## Changelog

### Part 2 — CSS Styling and Responsive Design
- **9 September 2026** — Created external stylesheet (`css/style.css`) and linked
  it to all 5 pages; applied the black/white/blue colour scheme and typography from
  the Website Project Proposal using CSS Grid and Flexbox.
- **11 September 2026** — Added `:hover` and `:focus` states to buttons, links and
  form fields.
- **13 September 2026** — Added responsive breakpoints at 1024px and 600px,
  switching multi-column layouts to single column and restyling the header and
  navigation for small screens.
- **16 September 2026** — Made the header logo a clickable link back to the
  homepage on every page.
- **17 September 2026** — Replaced the Contact page map placeholders with embedded
  Google Maps for the Main Store and Weekend Pop-Up locations.
- **17 September 2026** — Added responsive images (`srcset`/`sizes`) to the
  homepage hero image, the About page photo, and all 4 product images.
- **17 September 2026** — Fixed a Windows file-extension issue found during
  testing, where a renamed image had picked up a duplicate `.jpg` extension,
  causing broken images on the Products page.

### Part 1 — Building the Foundation
- **12 August 2026** — Initial HTML structure created for all 5 pages (index, about,
  products, enquiry, contact); base file/folder structure (css/, js/, images/)
  established; navigation linked across all pages.

## References
References are cited using the Harvard Style Referencing Guide – Adapted for the IIE.

### Images

Jones, W. (2019) *Nike shoe lot* [Photograph]. Available at: https://unsplash.com/photos/nike-shoe-lot-LFlVuWLjYEo (Accessed: 14 August 2026).

Houtman, C. (2020) *Person holding black and orange Nike athletic shoe* [Photograph]. Available at: https://unsplash.com/photos/person-holding-black-and-orange-nike-athletic-shoe-0_aAhxoXOSo (Accessed: 14 August 2026).

Smith, T. (2019) *Pair of white-black-and-red Air Jordan 1's* [Photograph]. Available at: https://unsplash.com/photos/pair-of-white-black-and-red-air-jordan-1s-NtRoxCiX8vc (Accessed: 14 August 2026).

Arora, A. (2024) *A black and white photo of a pair of shoes in a box* [Photograph]. Available at: https://unsplash.com/photos/a-black-and-white-photo-of-a-pair-of-shoes-in-a-box-XWsbsx0G_yQ (Accessed: 14 August 2026).

Mclean, E. (2020) *White and red Nike athletic shoe* [Photograph]. Available at: https://unsplash.com/photos/white-and-red-nike-athletic-shoe-pB1EleC-diQ (Accessed: 14 August 2026).

Schellino, P. (2020) *White and black Adidas athletic shoe* [Photograph]. Available at: https://unsplash.com/photos/white-and-black-adidas-athletic-shoe-RMMmKR8RCoo (Accessed: 14 August 2026).

### Market Research (Pricing)

StockX (2026) *Air Jordan 1 Retro High Off-White University Blue*. Available at: https://stockx.com/air-jordan-1-retro-high-off-white-university-blue (Accessed: 14 August 2026).

StockX (2026) *Adidas Yeezy Boost 350 V2 Bone*. Available at: https://stockx.com/adidas-yeezy-boost-350-v2-bone (Accessed: 14 August 2026).

StockX (2026) *OFF-WHITE Vulc Low White (Updated Stripes)*. Available at: https://stockx.com/off-white-vulc-low-white-2018 (Accessed: 14 August 2026).

StockX (2026) *Air Jordan 1 Retro High Off-White Chicago*. Available at: https://stockx.com/air-jordan-1-retro-high-off-white-chicago (Accessed: 14 August 2026).

Xe (2026) *1 USD to ZAR – US Dollars to South African Rand Exchange Rate*. Available at: https://www.xe.com/en-us/currencyconverter/convert/?Amount=1&From=USD&To=ZAR (Accessed: 14 August 2026).
