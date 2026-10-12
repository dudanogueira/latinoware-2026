/* Weaviate Slide Components — React factory functions (no JSX, no build step) */
/* Usage: const { Deck, TitleSlide, ... } = W; */

const W = (() => {
  const h = React.createElement;

  // ── Helpers ──────────────────────────────────────────────

  /** Wrap a title string, highlighting `greenWord` in green */
  function colorTitle(title, greenWord) {
    if (!greenWord || !title.includes(greenWord)) return title;
    const idx = title.indexOf(greenWord);
    return h('span', null,
      title.slice(0, idx),
      h('span', { className: 'green' }, greenWord),
      title.slice(idx + greenWord.length)
    );
  }

  // ── Deck (root wrapper + navigation) ────────────────────

  function Deck(props, ...children) {
    const kids = children.flat(Infinity);
    const [current, setCurrent] = React.useState(0);
    const [fragments, setFragments] = React.useState({});
    const viewportRef = React.useRef(null);
    const isPrint = location.search.includes('print');

    // Collect fragment counts per slide
    const fragCounts = React.useRef([]);
    React.useEffect(() => {
      const vp = viewportRef.current;
      if (!vp) return;
      const slides = vp.querySelectorAll('.slide');
      fragCounts.current = Array.from(slides).map(
        s => s.querySelectorAll('.fragment').length
      );
    }, [kids.length]);

    // Responsive scaling
    React.useEffect(() => {
      if (isPrint) return;
      const vp = viewportRef.current;
      if (!vp) return;
      function resize() {
        const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
        vp.style.transform = `scale(${scale})`;
        // Center vertically
        const scaledH = 1080 * scale;
        const offsetY = Math.max(0, (window.innerHeight - scaledH) / 2);
        const scaledW = 1920 * scale;
        const offsetX = Math.max(0, (window.innerWidth - scaledW) / 2);
        vp.style.left = offsetX + 'px';
        vp.style.top = offsetY + 'px';
      }
      resize();
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
    }, [isPrint]);

    // Print mode: show all slides stacked, mark ready
    React.useEffect(() => {
      if (isPrint) {
        document.body.classList.add('print-mode');
        // Signal PDF exporter
        requestAnimationFrame(() => {
          document.body.classList.add('deck-print-ready');
        });
      }
    }, [isPrint]);

    // Keyboard navigation
    React.useEffect(() => {
      if (isPrint) return;
      function onKey(e) {
        const total = kids.length;
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
          e.preventDefault();
          // Check fragments on current slide
          const fc = fragCounts.current[current] || 0;
          const shown = fragments[current] || 0;
          if (shown < fc) {
            setFragments(prev => ({ ...prev, [current]: shown + 1 }));
          } else {
            setCurrent(c => Math.min(c + 1, total - 1));
            setFragments(prev => ({ ...prev, [current + 1]: 0 }));
          }
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          e.preventDefault();
          setCurrent(c => Math.max(c - 1, 0));
        } else if (e.key === 'Home') {
          e.preventDefault();
          setCurrent(0);
        } else if (e.key === 'End') {
          e.preventDefault();
          setCurrent(total - 1);
        }
      }
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, [current, fragments, kids.length, isPrint]);

    // Mark visible fragments
    React.useEffect(() => {
      if (isPrint) return;
      const vp = viewportRef.current;
      if (!vp) return;
      const activeSlide = vp.querySelectorAll('.slide')[current];
      if (!activeSlide) return;
      const frags = activeSlide.querySelectorAll('.fragment');
      const shown = fragments[current] || 0;
      frags.forEach((f, i) => {
        f.classList.toggle('visible', i < shown);
      });
    }, [current, fragments, isPrint]);

    const total = kids.length;
    const slideElements = kids.map((child, i) => {
      if (!child) return null;
      const isActive = isPrint || i === current;
      // Clone child to inject active class
      if (child.props) {
        const origClass = child.props.className || '';
        const newClass = origClass + (isActive ? ' active' : '');
        return React.cloneElement(child, { key: i, className: newClass });
      }
      return child;
    });

    return h('div', null,
      h('div', { id: 'viewport', ref: viewportRef }, ...slideElements),
      !isPrint && h('div', { className: 'slide-counter' }, `${current + 1} / ${total}`),
      !isPrint && h('div', {
        className: 'progress-bar',
        style: { width: `${((current + 1) / total) * 100}%` }
      })
    );
  }

  // ── Slide components ────────────────────────────────────

  /** Official Weaviate horizontal logo (gradient W + white wordmark, ref: page-01) */
  const WEAVIATE_LOGO_SVG = '<svg xmlns="http://www.w3.org/2000/svg" id="weaviate_logos" viewBox="0 0 614.6 106"><defs><linearGradient id="lg0" x1="84.2" x2="72.6" y1="-2328.6" y2="-2442.5" gradientTransform="translate(0 2433.9)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#75be2c"/><stop offset=".9" stop-color="#9dc03b"/></linearGradient><linearGradient id="lg1" x1="78.7" x2="78.7" y1="-2376.1" y2="-2338.8" gradientTransform="translate(0 2433.9)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#238d37"/><stop offset=".9" stop-color="#35537f"/></linearGradient><linearGradient id="lg2" x1="74.7" x2="80.5" y1="-2395.4" y2="-2357.4" gradientTransform="translate(0 2433.9)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#67d84d"/><stop offset="1" stop-color="#348522"/></linearGradient><linearGradient id="lg3" x1="132.4" x2="132.4" y1="-2425.4" y2="-2359.2" gradientTransform="translate(0 2433.9)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#e4d00a"/><stop offset=".6" stop-color="#c4d132"/></linearGradient><linearGradient id="lg4" x1="24.8" x2="24.8" y1="-2425.4" y2="-2359.2" gradientTransform="translate(0 2433.9)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#e4d00a"/><stop offset=".6" stop-color="#c4d132"/></linearGradient><linearGradient id="lg5" x1="117.3" x2="117.3" y1="-2358.4" y2="-2336.3" gradientTransform="translate(0 2433.9)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#8ab11b"/><stop offset="1" stop-color="#6eaf02"/></linearGradient><linearGradient id="lg6" x1="133.3" x2="128.7" y1="-2385.1" y2="-2347.9" gradientTransform="translate(0 2433.9)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#75be2c"/><stop offset=".9" stop-color="#9dc03b"/></linearGradient><linearGradient id="lg7" x1="40" x2="40" y1="-2358.3" y2="-2336.4" gradientTransform="translate(0 2433.9)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#8ab11b"/><stop offset="1" stop-color="#6eaf02"/></linearGradient><linearGradient id="lg8" x1="28.4" x2="23.8" y1="-2384.9" y2="-2340.2" gradientTransform="translate(0 2433.9)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#75be2c"/><stop offset=".9" stop-color="#9dc03b"/></linearGradient></defs><path d="M147.6 24.3 122.1 9.5c-4.3-2.5-9.7.6-9.7 5.6v37.5L94.3 42.2c-9.7-5.6-21.7-5.6-31.4 0L44.8 52.6V15c0-5-5.4-8-9.7-5.6L9.6 24.3c-3 1.7-4.8 4.9-4.8 8.3v35.3q0 3.75 1.8 6.9c1.2 2.1 2.8 3.9 4.9 5.3l13.2 8.4 10.1 6.4c6.1 3.9 13.8 3.5 19.6-.8l.8-.6.2-.2 15.2-11.6c4.4-3.4 11.7-3.4 16.2 0l15.1 11.5.9.7c5.7 4.3 13.5 4.6 19.6.8l10.1-6.4 13.2-8.4c2.1-1.3 3.8-3.2 4.9-5.3s1.8-4.4 1.8-6.9V32.5c0-3.4-1.8-6.6-4.8-8.3Z" style="fill:url(#lg0)"/><path d="M112.6 75.4v12.7c0 3.9-2.8 7.1-6.2 7.1s-3-.7-4.6-1.9L86.7 81.7c-4.4-3.4-11.7-3.4-16.2 0L55.3 93.3c-1.5 1.1-2.5 1.5-3.9 1.5a6.6 6.6 0 0 1-6.7-6.8V75.4l21.7-14c7.4-4.8 17-4.8 24.4 0l21.8 13.7z" style="fill:url(#lg1)"/><path d="M112.4 52.5v23.1L90.9 61.8C83.5 57 74 57 66.5 61.8L44.8 75.6V52.5l18.1-10.4c9.7-5.6 21.6-5.6 31.4 0z" style="fill:url(#lg2)"/><path d="M152.4 32.6v35.2q0 3.75-1.8 6.9l-38.2-22.2V15c0-5 5.4-8 9.7-5.6l25.5 14.8c3 1.7 4.8 4.9 4.8 8.3Z" style="fill:url(#lg3)"/><path d="M44.8 15v37.6L6.6 74.8q-1.8-3.15-1.8-6.9V32.6c0-3.4 1.8-6.6 4.8-8.3L35.1 9.5c4.3-2.5 9.7.6 9.7 5.6Z" style="fill:url(#lg4)"/><path d="M105.9 94.7c3.4 0 6.6-2.7 6.6-6.5V75.5l20.2 12.9-10.2 6.5a17 17 0 0 1-19.6-.8l-1-.8c1.4 1 2.6 1.4 4 1.4" style="fill:url(#lg5)"/><path d="M150.6 74.8c-1.1 2.1-2.8 3.9-4.9 5.3l-13.2 8.4-20.1-12.8V52.6l38.2 22.3Z" style="fill:url(#lg6)"/><path d="M44.8 88.2c0 3.9 3.2 6.9 6.6 6.5 1.5-.2 2.7-.4 3.9-1.3l-.9.7c-5.7 4.3-13.5 4.6-19.6.8l-10.1-6.4 20.1-12.9z" style="fill:url(#lg7)"/><path d="M44.8 52.5v23.1L24.7 88.5l-13.2-8.4c-2.1-1.3-3.8-3.2-4.9-5.3l38.2-22.2Z" style="fill:url(#lg8)"/><path d="M607 54q2.7-2.4 2.7-8.1c0-5.7-.5-4.7-1.6-7s-2.6-4.4-4.6-6.3-4.5-3.4-7.3-4.4c-2.8-1.2-6-1.7-9.5-1.7-5.2 0-9.8 1.2-13.9 3.4-4 2.2-7.2 5.3-9.4 9.1-2.3 3.8-3.4 8.3-3.4 13.2s.6 7.2 1.8 10.4 3 6.1 5.3 8.6c2.3 2.4 5.2 4.4 8.6 5.8 3.3 1.4 7.2 2.1 11.4 2.1s7.2-.4 10.2-1.3c3-.8 5.5-1.9 7.2-3.1 1.9-1.3 2.8-2.6 2.8-3.8s0-1.2-.2-1.8-.5-1.1-.9-1.8c-.4-.8-1-1.4-1.8-1.6-.7-.3-1.4-.4-2.2-.2-.6.2-1.3.4-1.9.8-.5.3-1.2.7-1.9 1s-1.6.7-2.7 1-2.2.6-3.5.8-3 .3-4.9.3-5.1-.6-7.6-1.7-4.5-2.8-6.2-4.8c-1.4-1.9-2.2-4.2-2.3-6.8h29.5a10 10 0 0 0 6.6-2.3Zm-7.3-7.9c0 1.2-.2 2-.7 2.2-.4.2-1.1.4-2.6.4h-25.5c0-2.2.7-4.2 2-6 1.4-2 3.3-3.6 5.7-4.7q3.75-1.8 8.1-1.8c4.35 0 4.8.5 6.7 1.4 2 .9 3.5 2.2 4.6 3.7 1.1 1.4 1.6 3 1.6 4.8ZM549 27.5q-1.2-.3-2.7-.3h-9.2V13.9q0-1.65-.3-2.7c-.3-.9-.8-1.6-1.7-2-.8-.5-1.9-.7-3.3-.7s-2.5.2-3.3.8c-.8.5-1.3 1.1-1.5 2-.2.8-.3 1.7-.3 2.8v13.4H522c-1.6 0-2.8.4-3.5 1.3-.7.8-1.1 2.1-1.1 3.9s.3 3.1.8 3.9c.7.9 1.9 1.3 3.6 1.3h4.9v23.5c0 3.3.3 6.1 1 8.3s1.8 4.1 3.3 5.6c1.5 1.4 3.5 2.5 5.8 3.2s5.2 1 8.5 1 1.8-.1 2.5-.3q1.5-.3 2.1-1.5c.5-.8.7-2 .7-3.5s-.2-2.5-.6-3.2c-.4-.8-1.1-1.3-2-1.6-.8-.2-1.7-.3-2.9-.3s-2.9 0-4-.2c-1-.1-1.8-.4-2.3-.9q-.75-.75-1.2-2.1c-.3-1.1-.4-2.5-.4-4.3V38.1h9.3c1 .1 1.9 0 2.7-.2.9-.3 1.5-.8 2-1.7.4-.8.6-1.9.6-3.4s-.2-2.6-.7-3.3a2.7 2.7 0 0 0-2-1.6ZM507.1 27.3c-.7-.5-1.7-.8-3.2-.8s-3.1.4-4 1.2c-.8.8-1.2 2.1-1.2 3.8v2.3c-.8-1-1.8-1.9-2.8-2.8q-2.4-2.1-5.7-3.3c-2.2-.9-4.9-1.3-8.1-1.3s-6.6.7-9.6 2.1a27 27 0 0 0-7.8 5.7q-3.45 3.6-5.4 8.4c-1.2 3.1-1.8 6.5-1.8 10s.6 7 1.8 10.2c1.3 3.2 3 6 5.2 8.5 2.3 2.5 4.9 4.4 7.8 5.8 3 1.4 6.2 2.1 9.7 2.1s6.5-.6 9-1.7c2.4-1.2 4.4-2.5 5.9-4 .7-.7 1.3-1.4 1.8-2l-.2 2.8c.2 1.6.6 2.8 1.3 3.5.8.8 2.1 1.1 3.8 1.1s2.5-.2 3.3-.7c.8-.4 1.3-1.2 1.6-2.1.2-.8.3-1.8.3-2.8V32.4c0-1.2-.1-2.2-.3-3.1s-.8-1.7-1.5-2.2Zm-8.9 25.5c0 3.1-.7 5.9-2 8.4-1.2 2.3-3 4.3-5.3 5.7q-3.3 2.1-7.2 2.1c-3.9 0-5.9-.7-8.3-2-2.3-1.4-4.2-3.3-5.5-5.7s-2-5.2-2-8.2.7-5.9 2-8.3 3.1-4.4 5.4-5.8c2.3-1.5 5.1-2.2 8.2-2.2s5.1.7 7.2 2.1q3.3 1.95 5.4 5.7a16 16 0 0 1 2.1 8.3ZM446.5 27.2c-.8-.5-1.8-.7-3.3-.7s-2.6.2-3.5.6c-.8.4-1.3 1.1-1.6 2q-.3 1.2-.3 2.7v42.1q0 1.5.3 2.7c.3.9.8 1.5 1.6 2s1.9.7 3.4.7 2.5-.2 3.2-.6c.9-.4 1.4-1.1 1.7-2q.3-1.2.3-2.7V32c0-1.1-.1-2.1-.3-2.8-.3-.9-.8-1.5-1.5-2M446.9 9.1c-.9-.5-2.1-.7-3.7-.7s-2.9.2-3.8.7c-.9.4-1.6 1.2-1.9 2.2-.3.8-.5 1.9-.5 3.1s.1 2.2.3 3.1c.3 1 1 1.8 1.9 2.4.9.5 2.1.7 3.8.7s2.9-.2 3.8-.7 1.5-1.2 1.8-2.2c.3-.9.5-2 .5-3.1s-.1-2.2-.4-3.1c-.3-1-.9-1.8-1.8-2.3ZM425.5 27.4c-2.2-1.1-3.9-1.2-5-.3-1 .8-1.9 2-2.7 3.7l-14.5 34.4-14.9-35.5c-.8-1.8-1.8-2.8-3-3.1-1.1-.3-2.5 0-4 .7-1.7.8-2.8 1.8-3.2 2.8-.5 1-.4 2.5.5 4.4l19.2 42c.5 1 1.2 1.8 2.1 2.2s1.9.6 3.2.6 2.5-.2 3.4-.7 1.6-1.2 2-2.2l19.1-41.3c.7-1.4 1-2.7 1-3.9s-1.1-2.7-3.2-3.8M367.7 27.3c-.7-.5-1.7-.8-3.2-.8s-3.1.4-4 1.2-1.2 2.1-1.2 3.8v2.3c-.8-1-1.8-1.9-2.8-2.8q-2.4-2.1-5.7-3.3c-2.2-.9-4.9-1.3-8.1-1.3s-6.6.7-9.6 2.1a27 27 0 0 0-7.8 5.7q-3.45 3.6-5.4 8.4c-1.2 3.1-1.8 6.5-1.8 10s.6 7 1.8 10.2c1.3 3.2 3 6 5.2 8.5 2.3 2.5 4.9 4.4 7.8 5.8 3 1.4 6.2 2.1 9.7 2.1s6.5-.6 9-1.7c2.4-1.2 4.4-2.5 5.9-4 .7-.7 1.3-1.4 1.8-2l-.2 2.8c.1 1.6.6 2.8 1.4 3.5.8.8 2.1 1.1 3.8 1.1s2.5-.2 3.3-.7c.8-.4 1.3-1.2 1.6-2.1.2-.8.3-1.8.3-2.8V32.4c0-1.2-.1-2.2-.3-3.1s-.8-1.7-1.5-2.2Zm-8.9 25.5c0 3.1-.7 5.9-2 8.4-1.2 2.3-3 4.3-5.3 5.7q-3.3 2.1-7.2 2.1c-3.9 0-5.9-.7-8.3-2-2.3-1.4-4.2-3.3-5.5-5.7s-2-5.2-2-8.2.7-5.9 2-8.3 3.1-4.4 5.4-5.8c2.3-1.5 5.1-2.2 8.2-2.2s5.1.7 7.2 2.1q3.3 1.95 5.4 5.7a16 16 0 0 1 2.1 8.3ZM303.5 32.7c-2-1.9-4.5-3.4-7.3-4.4-2.8-1.2-6-1.7-9.5-1.7-5.2 0-9.9 1.2-13.9 3.4s-7.2 5.3-9.5 9.1-3.4 8.3-3.4 13.2.6 7.2 1.8 10.4 3 6.1 5.3 8.6c2.4 2.4 5.2 4.4 8.6 5.8 3.3 1.4 7.2 2.1 11.4 2.1s7.2-.4 10.2-1.3c3-.8 5.5-1.9 7.2-3.1 1.9-1.3 2.8-2.6 2.8-3.8s0-1.2-.2-1.8-.5-1.1-.9-1.8c-.4-.8-1-1.4-1.8-1.6-.7-.3-1.4-.4-2.2-.2-.6.2-1.3.4-1.9.8-.5.3-1.2.7-1.9 1s-1.6.7-2.6 1-2.2.6-3.5.8c-1.4.2-3 .3-4.9.3s-5.1-.6-7.6-1.7-4.5-2.8-6.2-4.8c-1.4-1.9-2.2-4.2-2.3-6.8h29.5a10 10 0 0 0 6.6-2.3q2.7-2.4 2.7-8.1c0-5.7-.5-4.7-1.6-7s-2.6-4.4-4.6-6.3Zm-3.8 13.4c0 1.2-.2 2-.7 2.2-.4.2-1.1.4-2.6.4h-25.5c0-2.2.7-4.2 2-6 1.4-2 3.3-3.6 5.7-4.7q3.75-1.8 8.1-1.8c4.35 0 4.8.5 6.7 1.4 2 .9 3.5 2.2 4.6 3.7 1.1 1.4 1.6 3 1.6 4.8ZM251.5 27.1c-1.8-.7-3.4-.8-4.5-.2s-1.9 1.8-2.6 3.6l-11.1 29.8-10.2-29.7c-.2-.6-.5-1.2-1-1.8-.4-.6-1-1-1.6-1.4-.7-.4-1.6-.6-2.8-.6s-2 .2-2.7.6-1.3.9-1.7 1.6c-.3.5-.5 1.1-.8 1.7l-10.4 29.4L191 30c-.6-1.7-1.5-2.8-2.6-3.2s-2.5-.3-4.3.4c-1.1.4-2 .8-2.6 1.4s-.9 1.3-1 2.2c0 .8.2 1.8.6 2.9l16.1 41.4c.1.7.4 1.3.7 1.9.4.6.9 1.1 1.6 1.4.7.4 1.7.6 2.8.6s1.9-.2 2.6-.5 1.2-.8 1.6-1.5c.4-.6.7-1.3 1-2.2L218 44.3l10.5 30.5c.3.7.6 1.4 1 2.1s1 1.2 1.6 1.5c.7.3 1.5.5 2.6.5s2-.2 2.6-.6c.7-.3 1.3-.8 1.6-1.4q.6-.9.9-1.8l16.1-41.4q1.2-2.85.3-4.5t-3.3-2.4Z" fill="#f7f9fd"/></svg>';

  function WeaviateLogo() {
    return h('div', {
      className: 'weaviate-logo',
      dangerouslySetInnerHTML: { __html: WEAVIATE_LOGO_SVG }
    });
  }

  function TitleSlide(props) {
    return h('div', { className: 'slide dark slide-title' },
      WeaviateLogo(),
      h('h1', null, colorTitle(props.title || '', props.greenWord)),
      props.subtitle && h('p', { className: 'subtitle' }, props.subtitle),
      (props.author || props.date) && h('p', { className: 'meta' },
        [props.author, props.date].filter(Boolean).join(' · ')
      )
    );
  }

  function SectionSlide(props) {
    return h('div', { className: 'slide dark slide-section' },
      h('h2', null, colorTitle(props.title || '', props.greenWord)),
      props.subtitle && h('p', { className: 'subtitle' }, props.subtitle)
    );
  }

  function ContentSlide(props, ...children) {
    const p = props || {};
    const variant = p.variant || 'dark';
    return h('div', { className: `slide ${variant} slide-content` },
      p.title && h('h2', null, p.title),
      ...children.flat(Infinity)
    );
  }

  function QuoteSlide(props) {
    const variant = props.variant || 'dark-vibrant';
    return h('div', { className: `slide ${variant} slide-quote` },
      h('p', { className: 'quote-text' }, props.quote),
      props.attribution && h('p', { className: 'attribution' }, `— ${props.attribution}`)
    );
  }

  function ThankYouSlide(props, ...children) {
    const p = props || {};
    // Default social links matching Weaviate template (ref: page-81)
    const defaultLinks = [
      { icon: '\uD83C\uDF10', text: 'weaviate.io' },
      { icon: '\uD83D\uDC19', text: 'weaviate/weaviate' },
      { icon: '\uD83D\uDCBC', text: 'linkedin' },
      { icon: '\uD835\uDD4F', text: '@weaviate_io' }
    ];
    const links = p.links || defaultLinks;
    const kids = children.flat(Infinity);

    return h('div', { className: 'slide dark slide-thankyou' },
      h('h2', null, p.title || 'Thank You!'),
      links.length > 0 && h('div', { className: 'thankyou-links' },
        ...links.map(l =>
          h('div', { className: 'thankyou-link' },
            h('span', { className: 'link-icon' }, l.icon),
            l.text
          )
        )
      ),
      p.message && h('p', null, p.message),
      ...kids
    );
  }

  function TextSlide(props, ...children) {
    const p = props || {};
    // Decorative art panel (CSS-only 3D blob approximation, ref: page-03)
    const artPanel = h('div', { className: 'text-art' },
      h('div', { className: 'text-art-inner' },
        h('div', { className: 'art-shape s1' }),
        h('div', { className: 'art-noodle' }),
        h('div', { className: 'art-blob b1' }),
        h('div', { className: 'art-shape s2' }),
        h('div', { className: 'art-ring' }),
        h('div', { className: 'art-shape s3' }),
        h('div', { className: 'art-shape s4' }),
        h('div', { className: 'art-blob b2' })
      )
    );

    return h('div', { className: 'slide slide-text' },
      h('div', { className: 'text-frame' },
        h('div', { className: 'text-left' },
          p.title && h('h2', null, p.title),
          ...children.flat(Infinity)
        ),
        artPanel
      )
    );
  }

  function TableSlide(props, ...children) {
    const p = props || {};
    const headers = p.headers || [];
    const rows = p.rows || [];
    // Column widths: first column gets ~48%, rest split equally
    const colCount = headers.length;
    const restWidth = colCount > 1 ? (52 / (colCount - 1)).toFixed(1) + '%' : '100%';

    return h('div', { className: 'slide slide-table' },
      h('div', { className: 'table-topbar' },
        h('h2', null, colorTitle(p.title || '', p.greenWord))
      ),
      h('div', { className: 'table-body' },
        h('table', null,
          h('colgroup', null,
            ...headers.map((_, i) =>
              h('col', { key: i, style: { width: i === 0 ? '48%' : restWidth } })
            )
          ),
          h('thead', null,
            h('tr', null,
              ...headers.map((hdr, i) => h('th', { key: i }, hdr))
            )
          ),
          h('tbody', null,
            ...rows.map((row, ri) =>
              h('tr', { key: ri },
                ...row.map((cell, ci) => {
                  // Support special markers: "✓" and "×"
                  if (cell === '✓') return h('td', { key: ci }, h('span', { className: 'table-check' }, '✓'));
                  if (cell === '×' || cell === '✗') return h('td', { key: ci }, h('span', { className: 'table-cross' }, '×'));
                  return h('td', { key: ci }, cell);
                })
              )
            )
          )
        )
      )
    );
  }

  function SplitTextBulletsSlide(props, ...children) {
    const p = props || {};
    const bullets = children.flat(Infinity);
    return h('div', { className: 'slide slide-split-text-bullets' },
      p.title && h('h2', null, colorTitle(p.title || '', p.greenWord)),
      h('div', { className: 'stb-cols' },
        p.copy && h('div', { className: 'stb-copy' }, p.copy),
        bullets.length > 0 && h('ul', { className: 'stb-bullets' },
          ...bullets.map((b, i) =>
            typeof b === 'string' ? h('li', { key: i }, b) : b
          )
        )
      )
    );
  }

  // ── Layout helpers ──────────────────────────────────────

  function CardGrid(props, ...children) {
    return h('div', { className: 'card-grid' }, ...children.flat(Infinity));
  }

  function Card(props, ...children) {
    const p = props || {};
    return h('div', { className: 'card' },
      p.title && h('div', { className: 'card-title' }, p.title),
      ...children.flat(Infinity)
    );
  }

  function Stat(props) {
    const p = props || {};
    return h('div', { className: 'stat' },
      h('div', { className: 'stat-value' }, p.value),
      p.label && h('div', { className: 'stat-label' }, p.label)
    );
  }

  function Badge(props) {
    const p = props || {};
    return h('span', { className: 'badge' }, p.n);
  }

  function BadgeGrid(props, ...children) {
    return h('div', { className: 'badge-grid' }, ...children.flat(Infinity));
  }

  function BadgeItem(props, ...children) {
    const p = props || {};
    const desc = children.flat(Infinity);
    return h('div', { className: 'badge-item' },
      h('span', { className: 'badge' }, p.n),
      h('div', { className: 'badge-item-title' }, p.title),
      desc.length > 0 && h('div', { className: 'badge-item-desc' }, ...desc)
    );
  }

  function CodeBlock(props, ...children) {
    const p = props || {};
    const code = children.flat(Infinity).join('');
    const lang = p.language || '';
    // Use highlight.js if available
    let highlighted = null;
    if (typeof hljs !== 'undefined' && lang) {
      try {
        highlighted = hljs.highlight(code, { language: lang }).value;
      } catch (e) { /* fall through */ }
    }
    // Auto-compact for long code blocks (>15 lines)
    const lineCount = code.split('\n').length;
    const compact = lineCount > 15;
    const codeClass = `language-${lang}${compact ? ' carbon-compact' : ''}`;
    // Carbon-style window chrome: traffic light dots + title bar
    const titleBar = h('div', { className: 'carbon-titlebar' },
      h('div', { className: 'carbon-dots' },
        h('span', { className: 'carbon-dot red' }),
        h('span', { className: 'carbon-dot yellow' }),
        h('span', { className: 'carbon-dot green' })
      ),
      p.title ? h('span', { className: 'carbon-title' }, p.title) : null
    );
    return h('div', { className: 'carbon-window' },
      titleBar,
      h('pre', null,
        highlighted
          ? h('code', { className: codeClass, dangerouslySetInnerHTML: { __html: highlighted } })
          : h('code', { className: codeClass }, code)
      )
    );
  }

  function Fragment(props, ...children) {
    const p = props || {};
    return h('div', { className: 'fragment', 'data-order': p.order || 0 },
      ...children.flat(Infinity)
    );
  }

  function Columns(props, ...children) {
    return h('div', { className: 'columns' }, ...children.flat(Infinity));
  }

  function Column(props, ...children) {
    return h('div', { className: 'column' }, ...children.flat(Infinity));
  }

  // ── Public API ──────────────────────────────────────────

  return {
    Deck, TitleSlide, SectionSlide, ContentSlide, TextSlide, QuoteSlide, ThankYouSlide,
    TableSlide, SplitTextBulletsSlide,
    CardGrid, Card, Stat, Badge, BadgeGrid, BadgeItem, CodeBlock, Fragment, Columns, Column
  };
})();
