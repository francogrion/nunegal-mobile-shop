const APP_NAME = 'Mobile Shop'

/**
 * Sets the document title for the current page. React 19 hoists `<title>`
 * into the document head wherever it is rendered.
 */
function PageTitle({ title }) {
  return <title>{`${title} · ${APP_NAME}`}</title>
}

export default PageTitle
