# Changelog

## 1.3.0 (2026-02-27)

### Features

* **data:** perform global database seed for Tran Toc My Nguyen with over 260 members across 7 generations, 33 living male descendants (Sprint 9)
* **ui:** upgrade Landing Page with Zolina font, new heritage content, and route pending users to landing page instead of home (Sprint 10)
* **guide:** add comprehensive User Guide page and interlink from landing page (Sprint 10)

## 1.2.0 (2026-02-27)

### Features

* **admin:** implement comprehensive activity logging with DB triggers and detailed UI descriptions (Sprint 8)
* **fund:** redesign fund management with edit/delete modals and auditor trail (Sprint 7)
* **book:** implement PDF export with professional layout and pagination (Sprint 6)
* **gedcom:** add GEDCOM import support for international genealogy standards (Sprint 6)
* **pwa:** enhance offline support and push notifications with service workers (Sprint 6)

### Bug Fixes

* **notifications:** fix localStorage error during SSR in notification menu
* **admin:** resolve `is_active` field error when creating/approving users
* **ui:** replace window.confirm with accessible Shadcn UI AlertDialog across admin features

## 1.0.0 (2026-02-26)


### Features

* add Landing Page, Home Dashboard & custom 404 page ([0047c9c](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/0047c9c0a7caf24e365b4c698c2973dce1b68361))
* **admin:** add user approval system, accountant role, PWA & push notifications ([4f64b45](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/4f64b458ee901b8120b364e6d08e20fea56b1f5e))
* **admin:** implement analytics and fund management tabs with optimized rpc ([fb45e00](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/fb45e00f925726ddad3e1e0f3598a54cf1c52946))
* **admin:** implement mobile dropdown menu for tabs ([4af1c81](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/4af1c8165544cfcb1ecd1dc42508328c9183b9c2))
* **admin:** implement user management dashboard and tree view enhancements ([8ec1982](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/8ec1982ecd46a1d55bd969a91f9e580ab93b1874))
* **board:** add contribution and comment counts to newsfeed ([fc632f5](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/fc632f5fb055ef5d239ff38b225e85fccb2243dc))
* **board:** add member newsfeed and contribution submit form ([e271f71](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/e271f71f3dd7e0e99943a830021776c7a487fb06))
* **board:** implement comment system, admin author visibility, and fix auth input colors ([e8b0b87](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/e8b0b870e1dea87fc7ba39e766dd8703fb2d2cb2))
* **book:** add pdf export, pwa offline support, and gedcom import ([a6b6d2b](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/a6b6d2ba0ec91415f14bcb4dad7626e5c4c87e03))
* complete phase 2 advanced features including global search, tree sharing, analytics and fixing type errors ([fa6864b](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/fa6864bb5ee760dd661e02740ee6cc7b213df28d))
* complete Phase 3 with offline PWA support, PDF exporting and In-App notifications for upcoming events ([799bced](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/799bcedc79e7673871343992bba98774c593c723))
* enhance app quality with tests, strict types, SEO, skeletons, images ([7e1b527](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/7e1b527a1ca9d1c06fca6d8f17039de511051fc9))
* **foundation:** sprint 1-2 - tests, type cleanup, middleware optimization, pagination ([cd3fed2](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/cd3fed2e3b4e590e096de66f783c780b1c68134a))
* implement forgot and update password pages ([a2c59bf](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/a2c59bf128a4211af939319798ddd7c70949daf5))
* Integrate Mei Tran AI Assistant using Gemini 3 and Supabase Tool Calling ([0f6f9ee](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/0f6f9ee7017cb9a6afa5fa71c8ffea04a1330907))
* **navigation:** add newsfeed (Bảng Tin) to sidebar menu ([06e1a3b](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/06e1a3ba2f18a680d1e5c29bd5ce6b13a178279a))
* Phase 1 + Phase 2 complete ([3c56804](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/3c56804c92ee26a9216daf3d28c10805f19cae89))
* redesign auth pages to heritage light split-screen & complete color palette refactor ([df0b743](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/df0b7437c1c8fcc69594183884db9209f2a78418))
* redesign sidebar to match auth left panel & restore theme toggle ([6b0032b](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/6b0032bc62f6982bcf83a590e7260a6dcb21e153))
* **search:** deploy global search, enhance analytics, and extend BFS ([beb1223](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/beb1223ac6d84b3018d588e814b54d49fafe2f80))
* setup PWA manifest and service worker, implement interactive family tree to PDF export ([63c99e5](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/63c99e5d695238c590582468e605b2563a8f8153))
* **sprint3-4:** realtime notifications + member profile detail page ([d2c6f51](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/d2c6f514256070af4aa69c8dd41b640d8734ec64))
* **tests:** complete sprint 1-2 - add supabase-data tests, board/fund load more UI ([09b93b0](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/09b93b095afe6f743b55d7fa1f85b9c1dc3b61d4))
* **ui:** add destructive delete modal and reposition PWA/notification prompts ([3c16773](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/3c1677360d3279e083571a84c77b139d4b373552))


### Bug Fixes

* **login:** add forgot password link ([02855ca](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/02855cabb3547a156cf3526d40685be8ac53e9b1))
* Replace Turbopack with Webpack for dev server to resolve oklab color parsing error ([d7f90a6](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/d7f90a62f7fdff0b7a07e6a3a2835937698189b3))
* resolve auth redirect loop by routing OAuth and Email signups through /auth/callback ([409f062](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/409f06250e4d9f8aa5e26db7297942ec49970f55))
* resolve hydration mismatch error caused by next-themes on sidebar toggle ([6b9abc5](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/6b9abc5870445248701a36041d7335d01e82dc1f))
* Resolve UX Audit failures regarding banned colors and missing aria-labels ([ed3acd8](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/ed3acd831e6cc6abab42c7ff93881e77f273b2e9))
* **types:** manually add comments table to database types ([4759ace](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/4759ace681398106b9651fd5d48833488a2b6134))
* **ui:** improve auth input contrast, sidebar avatar support, and rename user role ([b34766f](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/b34766fe188334029934c4e43c1263bd5687d82f))
* update production domain to trantocmynguyen.vercel.app ([5524e7e](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/5524e7e90b398473c6585c2c6f24e65eb2b534bc))


### Performance Improvements

* **board:** [Performance] optimize UI for Lighthouse A11y, SEO, and Best Practices ([94e0f5b](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/94e0f5b3a611e374580e109558e47ebd340c6c5d))
* **ui:** improve accessibility and layout for Lighthouse score ([ff462af](https://github.com/khanhttdev/gia-pha-dien-tu-tran-toc-my-nguyen/commit/ff462af24ade5f63bb6177ec092e90bedeae4b3b))
