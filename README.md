# Éverton Bottega — site

Site estático. Para regenerar as páginas depois de editar `tools/build.mjs` ou `content/posts.json`:

```
node tools/build.mjs
```

- `assets/site.css` e `assets/site.js`: visual e efeitos de rolagem (respeitam `prefers-reduced-motion`).
- `assets/img`, `assets/blog`, `assets/prod`: imagens.
- Para servir localmente: `python -m http.server 8080`.
