import { useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router'

/**
 * Starts every newly opened page at the top. The browser keeps the scroll
 * position across client-side navigations, so opening a product from the
 * bottom of the list would otherwise show its page scrolled down.
 *
 * Only path changes count: the search query changes the URL (and the
 * navigation type) while typing without opening a new page. Back/forward
 * navigations are left to the browser's own scroll restoration. A layout
 * effect runs before paint, so the old position never flashes.
 */
function ScrollToTop() {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()
  const previousPathname = useRef(pathname)

  useLayoutEffect(() => {
    if (pathname === previousPathname.current) return
    previousPathname.current = pathname
    if (navigationType !== 'POP') window.scrollTo(0, 0)
  }, [pathname, navigationType])

  return null
}

export default ScrollToTop
