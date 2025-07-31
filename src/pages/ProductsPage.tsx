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
import { QueryData } from '@supabase/supabase-js';

import { supabase } from '../supabaseClient';
import { ProductFormDialog } from '../componets/ProductFormDialog';
import { ConfirmationDialog } from '../componets/ConfirmationDialog';
import { CustomDataGrid } from '../componets/CustomDataGrid';
import { DialogImportData } from '../componets/DialogImportData';

const productsQuery = supabase.from('Produtos').select('*');
type Products = QueryData<typeof productsQuery>;
export type Product = Products[number];


const ProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Products>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<number | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [importDialogOpen, setImportDialogOpen] = useState(false);

    const columns: GridColDef<Product>[] = [
        { field: 'id', headerName: 'ID', width: 90, align: 'center', headerAlign: 'center' },
        { field: 'sku', headerName: 'SKU', width: 150 },
        { field: 'nome', headerName: 'Nome do Produto', flex: 1, minWidth: 250 },
        {
            field: 'preco',
            headerName: 'Preço (R$)',
            type: 'number',
            width: 130,
            valueFormatter: (value: number | null) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        },
        {
            field: 'valor_de_custo',
            headerName: 'Custo (R$)',
            type: 'number',
            width: 130,
            valueFormatter: (value: number | null) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        },
        { field: 'estoque', headerName: 'Estoque', type: 'number', width: 110, align: 'center', headerAlign: 'center' },
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
                <GridActionsCellItem icon={<EditIcon />} label="Editar" onClick={() => handleOpenEditDialog(params.row)} />,
                <GridActionsCellItem icon={<DeleteIcon />} label="Deletar" onClick={() => { if (params.row.id) { handleOpenConfirmDialog(params.row.id) } }} />,
                <Tooltip title={params.row.status === 'Ativo' ? 'Desativar' : 'Ativar'}>
                    <GridActionsCellItem
                        icon={params.row.status === 'Ativo' ? <ToggleOnIcon color="success" /> : <ToggleOffIcon color="error" />}
                        label={params.row.status === 'Ativo' ? 'Desativar' : 'Ativar'}
                        onClick={() => handleToggleStatus(params.row)}
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

    const handleOpenImportDialog = () => {
        setImportDialogOpen(true);
    }

    const handleOpenEditDialog = (product: Product) => {
        setEditingProduct(product);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingProduct(null);
        setImportDialogOpen(false);
    };

    const handleDeleteProduct = useCallback(async (productId: number) => {
        const { error } = await supabase.from('Produtos').delete().eq('id', productId);
        if (error) console.error('Erro ao deletar produto:', error.message);
        else fetchProducts();
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
        if (productToDelete) handleDeleteProduct(productToDelete);
        handleCloseConfirmDialog();
    };

    const handleToggleStatus = useCallback(async (product: Product) => {
        const newStatus = product.status === 'Ativo' ? 'Inativo' : 'Ativo';
        const { error } = await supabase.from('Produtos').update({ status: newStatus }).eq('id', product.id);

        if (error) console.error('Erro ao alterar status:', error.message);
        else fetchProducts();
    }, [fetchProducts]);

    const handleSaveProduct = useCallback(async (productData: Omit<Product, 'id' | 'created_at'>) => {

        const dataToSave = {
            ...productData,
            preco: Number(productData.preco) || 0,
            valor_de_custo: Number(productData.valor_de_custo) || null,
            estoque: Number(productData.estoque) || 0,
        };

        const { error } = editingProduct ?
            await supabase.from('Produtos').update(dataToSave).eq('id', editingProduct.id) :
            await supabase.from('Produtos').insert([dataToSave]);

        if (error) {
            console.error('Erro ao salvar produto:', error.message);
        } else {
            handleCloseDialog();
            fetchProducts();
        }
    }, [editingProduct, fetchProducts]);

    const mapearDadosProduto = (row: any) => {
        if (!row['Nome do Produto']) return null;
        return {
            sku: row['SKU'],
            nome: row['Nome do Produto'],
            preco: Number(String(row['Preço (R$)']).replace('R$', '').replace(/\./g, '').replace(',', '.').trim()),
            valor_de_custo: Number(String(row['Custo (R$)']).replace('R$', '').replace(/\./g, '').replace(',', '.').trim()) || null,
            estoque: Number(row['Estoque']),
            status: row['Status']
        };
    };

    const CABECALHOS_PRODUTOS = "SKU,Nome do Produto,Preço (R$),Custo (R$),Estoque,Status";

    const EXEMPLO_LINHA_PRODUTOS = `LP-001,"Laptop Gamer Pro","R$ 8.000,00","R$ 7.500,00",10,Ativo`;

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
                onImport={handleOpenImportDialog}
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

            <DialogImportData
                open={importDialogOpen}
                onClose={handleCloseDialog}
                title='Produtos'
                tableName='Produtos'
                csvExemplo={CABECALHOS_PRODUTOS}
                exemploLinhaCsv={EXEMPLO_LINHA_PRODUTOS} 
                mapeamentoColunas={mapearDadosProduto}
                onImportSuccess={() => {
                    fetchProducts();
                    handleCloseDialog();
                }}
            />
        </Box>
    );
};

export default ProductsPage;