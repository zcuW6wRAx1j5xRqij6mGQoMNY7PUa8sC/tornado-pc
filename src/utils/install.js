export const withInstall = (component) => {
    const comp = component
    comp.install = (app) => {
        app.component(comp.name, component)
    }
    return component
}
