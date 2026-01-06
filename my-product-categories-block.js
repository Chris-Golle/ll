const { registerBlockType } = wp.blocks;

registerBlockType( 'chris/product-categories-block', {
    title: 'Chris Product Categories',
    icon: 'products',
    category: 'widgets',

    save: () => {
        return null;
    }
} );
