/* A fresh visit/reload starts at the hero, even from an old #demo/#contact link.
 * In-page anchors still work normally after entry. No user data is stored. */
(function () {
  "use strict";
  if ("scrollRestoration" in window.history)
    window.history.scrollRestoration = "manual";
  if (window.location.hash) {
    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname + window.location.search,
    );
  }
  window.addEventListener(
    "pageshow",
    function (event) {
      if (!event.persisted)
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    },
    { once: true },
  );
})();
