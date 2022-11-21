module.exports = {
    plugins: [
        require('stylelint'),
        require('postcss-preset-env'),
        require('postcss-import'),
        require('precss'),
        require('postcss-sassy-mixins'),
        require('postcss-nesting'),
        require('autoprefixer')
    ]
}