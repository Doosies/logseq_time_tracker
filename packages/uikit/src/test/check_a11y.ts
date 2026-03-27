import axe from 'axe-core';

export async function checkA11y(container: Element, options?: axe.RunOptions): Promise<axe.AxeResults> {
    if (options !== undefined) {
        return axe.run(container, options);
    }
    return axe.run(container);
}
