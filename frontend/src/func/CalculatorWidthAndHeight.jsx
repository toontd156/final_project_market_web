const calculatorWidthAndHeight = (px) => {
    const scale = 1;
    const baseH = 1080;
    const pxToVh = (1 / baseH) * 100 * scale;
    return `calc(${pxToVh}vh * ${px})`;
};

export default calculatorWidthAndHeight;

// calculatorWidthAndHeight()
// import calculatorWidthAndHeight from '../../func/CalculatorWidthAndHeight';
