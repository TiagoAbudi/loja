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
import { CustomerFormDialog } from '../componets/CustomerFormDialog';
import { ConfirmationDialog } from '../componets/ConfirmationDialog';
import { CustomDataGrid } from '../componets/CustomDataGrid';

export interface Customer {
    id: number;
    nome: string;
    email: string;
    telefone: string;
    cpf_cnpj: string;
    endereco: string;
    status: 'Ativo' | 'Inativo';
}

type CustomerFormData = Omit<Customer, 'id' | 'created_at'>;

export const CustomersPage: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<number | null>(null);
    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 90, align: 'center', headerAlign: 'center' },
        { field: 'nome', headerName: 'Nome', width: 250 },
        { field: 'email', headerName: 'E-mail', width: 200 },
        {
            field: 'telefone',
            headerName: 'Telefone',
            width: 150,
            valueFormatter: (value: string | null) => {
                if (!value) {
                    return '-';
                }

                const cleaned = value.toString().replace(/\D/g, '');

                if (cleaned.length === 11) {
                    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
                }
                if (cleaned.length === 10) {
                    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
                }

                return value;
            },
        },
        {
            field: 'status', headerName: 'Status', width: 120, align: 'center', headerAlign: 'center',
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={params.value === 'Ativo' ? 'success' : 'error'}
                    variant="outlined"
                    size="small"
                />
            ),
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Ações',
            width: 120,
            getActions: (params: GridRowParams<Customer>) => [
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Editar"
                    onClick={() => handleOpenEditDialog(params.row)}
                />,
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Deletar"
                    onClick={() => handleOpenConfirmDialog(params.row.id)}
                />,
                <Tooltip title={params.row.status === 'Ativo' ? 'Desativar' : 'Ativar'}>
                    <GridActionsCellItem
                        icon={params.row.status === 'Ativo' ? <ToggleOnIcon color="success" /> : <ToggleOffIcon color="error" />}
                        label="Ativar/Desativar"
                        onClick={() => handleToggleStatus(params.row)}
                    />
                </Tooltip>
            ],
        },
    ];

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('Clientes')
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            console.error('Erro ao buscar Clientes:', error);
            setCustomers([]);
        } else if (data) {
            setCustomers(data);
        }
        setLoading(false);
    }, []);

    const handleOpenAddDialog = () => {
        setEditingCustomer(null);
        setDialogOpen(true);
    };

    const handleOpenEditDialog = (customer: Customer) => {
        setEditingCustomer(customer);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingCustomer(null);
    };

    const handleSaveCustomer = useCallback(async (customerData: CustomerFormData) => {
        let error;
        if (editingCustomer) {
            const { error: updateError } = await supabase
                .from('Clientes')
                .update(customerData)
                .eq('id', editingCustomer.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase.from('Clientes').insert([customerData]);
            error = insertError;
        }

        if (error) {
            console.error('Erro ao salvar cliente:', error.message);
        } else {
            handleCloseDialog();
            fetchCustomers();
        }
    }, [editingCustomer, fetchCustomers]);

    const handleOpenConfirmDialog = (id: number) => {
        setCustomerToDelete(id);
        setConfirmOpen(true);
    };

    const handleCloseConfirmDialog = () => {
        setCustomerToDelete(null);
        setConfirmOpen(false);
    };

    const handleConfirmDelete = useCallback(async () => {
        if (customerToDelete) {
            const { error } = await supabase.from('Clientes').delete().eq('id', customerToDelete);
            if (error) {
                console.error('Erro ao deletar cliente:', error.message);
            } else {
                fetchCustomers();
            }
        }
        handleCloseConfirmDialog();
    }, [customerToDelete, fetchCustomers]);

    const handleToggleStatus = useCallback(async (customer: Customer) => {
        const newStatus = customer.status === 'Ativo' ? 'Inativo' : 'Ativo';
        const { error } = await supabase
            .from('Clientes')
            .update({ status: newStatus })
            .eq('id', customer.id);

        if (error) {
            console.error('Erro ao alterar status do cliente:', error.message);
        } else {
            fetchCustomers();
        }
    }, [fetchCustomers]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    return (
        <Box sx={{ height: 'calc(100vh - 100px)', width: '100%' }}>
            <CustomDataGrid
                title="Clientes"
                rows={customers}
                columns={columns}
                loading={loading}
                onAdd={handleOpenAddDialog}
            />
            <CustomerFormDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                onSave={handleSaveCustomer}
                initialData={editingCustomer}
            />

            <ConfirmationDialog
                open={confirmOpen}
                onClose={handleCloseConfirmDialog}
                onConfirm={handleConfirmDelete}
                title="Confirmar Exclusão"
                message="Tem certeza de que deseja excluir este cliente? Esta ação não pode ser desfeita."
            />
        </Box>
    );
};

export default CustomersPage;