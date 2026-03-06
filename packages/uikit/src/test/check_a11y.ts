import axe from 'axe-core';

export async function checkA11y(container: Element): Promise<axe.AxeResults> {
    return axe.run(container);
}
