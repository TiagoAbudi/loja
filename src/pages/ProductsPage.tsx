import React, {
    useEffect,
    useState,
    useCallback
} from 'react';
import {
    Box,
    Chip,
    Tooltip
} from '@mui/material';
import {
    GridColDef,
    GridActionsCellItem,
    GridRowParams
} from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import { supabase } from '../supabaseClient';
import { ProductFormDialog } from '../componets/ProductFormDialog';
import { ConfirmationDialog } from '../componets/ConfirmationDialog';
import { CustomDataGrid } from '../componets/CustomDataGrid';

interface Product {
    id: number;
    sku: string;
    nome: string;
    preco: number | string;
    estoque: number | string;
    status: 'Ativo' | 'Inativo';
}

const ProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<number | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const columns: GridColDef[] = [
        {
            field: 'id',
            headerName: 'ID',
            width: 90,
            align: 'center',
            headerAlign: 'center'
        },
        {
            field: 'sku',
            headerName: 'SKU',
            width: 150
        },
        {
            field: 'nome',
            headerName: 'Nome do Produto',
            width: 250
        },
        {
            field: 'preco',
            headerName: 'Preço (R$)',
            type: 'number',
            width: 130,
            valueFormatter: (value: number) => value == null ? '' : value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        },
        {
            field: 'estoque',
            headerName: 'Estoque',
            type: 'number',
            width: 110
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => (
                <Chip label={params.value} color={params.value === 'Ativo' ? 'success' : 'error'} variant="outlined" size="small" />
            ),
            align: 'center',
            headerAlign: 'center'
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Ações',
            width: 150,
            getActions: (params: GridRowParams<Product>) => [
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Editar"
                    onClick={() => handleOpenEditDialog(params.row)}
                    color="inherit"
                />,
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Deletar"
                    onClick={() => handleOpenConfirmDialog(params.row.id)}
                    color="inherit"
                />,
                <Tooltip title={params.row.status === 'Ativo' ? 'Desativar' : 'Ativar'}>
                    <GridActionsCellItem
                        icon={params.row.status === 'Ativo' ? <ToggleOnIcon color="success" /> : <ToggleOffIcon color="error" />}
                        label={params.row.status === 'Ativo' ? 'Desativar' : 'Ativar'}
                        onClick={() => handleToggleStatus(params.row)}
                        color="inherit"
                    />
                </Tooltip>
            ]
        },
    ];

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('Produtos').select('*');

        if (error) {
            console.error('Erro ao buscar produtos:', error);
            setProducts([]);
        } else if (data) {
            setProducts(data);
        }
        setLoading(false);
    }, []);

    const handleOpenAddDialog = () => {
        setEditingProduct(null);
        setDialogOpen(true);
    };

    const handleOpenEditDialog = (product: Product) => {
        setEditingProduct(product);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingProduct(null);
    };

    const handleDeleteProduct = useCallback(async (productId: number) => {
        const { error } = await supabase.from('Produtos').delete().eq('id', productId);
        if (error) {
            console.error('Erro ao deletar produto:', error.message);
        } else {
            fetchProducts();
        }
    }, [fetchProducts]);

    const handleOpenConfirmDialog = (productId: number) => {
        setProductToDelete(productId);
        setConfirmDialogOpen(true);
    };

    const handleCloseConfirmDialog = () => {
        setProductToDelete(null);
        setConfirmDialogOpen(false);
    };

    const handleConfirmDelete = () => {
        if (productToDelete) {
            handleDeleteProduct(productToDelete);
        }
        handleCloseConfirmDialog();
    };

    const handleToggleStatus = useCallback(async (product: Product) => {
        const newStatus = product.status === 'Ativo' ? 'Inativo' : 'Ativo';
        const { error } = await supabase
            .from('Produtos')
            .update({ status: newStatus })
            .eq('id', product.id);

        if (error) {
            console.error('Erro ao alterar status do produto:', error.message);
        } else {
            fetchProducts();
        }
    }, [fetchProducts]);

    const handleSaveProduct = useCallback(async (productData: Omit<Product, 'id'>) => {
        const dataToSave = {
            ...productData,
            preco: Number(productData.preco),
            estoque: Number(productData.estoque),
        };

        let error;

        if (editingProduct) {
            const { error: updateError } = await supabase
                .from('Produtos')
                .update(dataToSave)
                .eq('id', editingProduct.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase.from('Produtos').insert([dataToSave]);
            error = insertError;
        }

        if (error) {
            console.error('Erro ao salvar produto:', error.message);
        } else {
            handleCloseDialog();
            fetchProducts();
        }
    }, [editingProduct, fetchProducts]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return (
        <Box sx={{ height: 'calc(100vh - 100px)', width: '100%' }}>
            <CustomDataGrid
                title="Produtos"
                rows={products}
                columns={columns}
                loading={loading}
                onAdd={handleOpenAddDialog}
            />

            <ProductFormDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                onSave={handleSaveProduct}
                initialData={editingProduct}
            />

            <ConfirmationDialog
                open={confirmDialogOpen}
                onClose={handleCloseConfirmDialog}
                onConfirm={handleConfirmDelete}
                title="Confirmar Exclusão"
                message="Tem certeza de que deseja excluir este produto? Esta ação não pode ser desfeita."
            />
        </Box>
    );
};

export default ProductsPage;