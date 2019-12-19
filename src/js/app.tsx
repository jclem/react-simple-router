import React, {createContext, PropsWithChildren, useState, useEffect} from 'react'

/*
 * Create a context that will contain the route state and a function to set the
 * route. Ignore the ugly TypeScript stuff that I do.
 */
const RouterContext = createContext<{
  route: string
  setRoute: (path: string) => void
}>({} as any)

/*
 * The RouterProvider is a function that will provde the RouterContext to our
 * entire app.
 */
function RouterProvider(props: PropsWithChildren<unknown>) {
  const [route, setRoute] = useState(location.pathname)

  useEffect(() => {
    const setRouteToPathname = () => setRoute(location.pathname)
    window.addEventListener('popstate', setRouteToPathname)
    return () => window.removeEventListener('popstate', setRouteToPathname)
  }, [])

  return (
    <RouterContext.Provider
      value={{
        route,
        setRoute: (path: string) => {
          window.history.pushState(null, '', path)
          setRoute(path)
        }
      }}
    >
      {props.children}
    </RouterContext.Provider>
  )
}

export default function App() {
  /*
   * The AppLink consumes the router context and displays text or a link
   * depending on whether the current route matches the link's intended path.
   * It just calls `setRoute` when clicked on.
   */
  const AppLink = (props: PropsWithChildren<{path: string}>) => {
    return (
      <RouterContext.Consumer>
        {({route, setRoute}) => {
          return route === props.path ? (
            props.children
          ) : (
            <a
              href={props.path}
              onClick={evt => {
                evt.preventDefault()
                setRoute(props.path)
              }}
            >
              {props.children}
            </a>
          )
        }}
      </RouterContext.Consumer>
    )
  }

  const Navigation = () => {
    return (
      <nav>
        <ul>
          <li>
            <AppLink path="/">Home</AppLink>
          </li>
          <li>
            <AppLink path="/about">About</AppLink>
          </li>
        </ul>
      </nav>
    )
  }

  const Home = () => {
    return (
      <>
        <h1>Home</h1>
        <Navigation />
      </>
    )
  }

  const About = () => {
    return (
      <>
        <h1>About</h1>
        <Navigation />
      </>
    )
  }

  const NotFound = () => {
    return (
      <>
        <p>Whoops! We couldn't find that page.</p>
        <Navigation />
      </>
    )
  }

  /*
   * The app sets up the RouterProvider, then itself consumes RouterContext to
   * render the right page for the current route.
   */
  return (
    <RouterProvider>
      <RouterContext.Consumer>
        {({route}) => {
          switch (route) {
            case '/':
              return <Home />
            case '/about':
              return <About />

            default:
              return <NotFound />
          }
        }}
      </RouterContext.Consumer>
    </RouterProvider>
  )
}
