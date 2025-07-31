import React from 'react';
import {
    Box,
    Typography,
    Tooltip,
    TextField,
    InputAdornment,
    styled,
    Badge,
    Divider,
    MenuItem,
    Menu,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    DataGrid,
    GridColDef,
    ToolbarButton,
    QuickFilterClear,
    ColumnsPanelTrigger,
    FilterPanelTrigger,
    ExportPrint,
    ExportCsv,
    QuickFilterTrigger,
    QuickFilterControl,
    Toolbar,
    useGridApiContext,
    useGridSelector,
    GridDensity,
    gridDensitySelector,
    GridRowId,
    GridValidRowModel,
    QuickFilter
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import FilterListIcon from '@mui/icons-material/FilterList';
import CancelIcon from '@mui/icons-material/Cancel';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { ptBR } from '@mui/x-data-grid/locales';
import CheckIcon from '@mui/icons-material/Check';
import TableRowsIcon from '@mui/icons-material/TableRows';
import PublishIcon from '@mui/icons-material/Publish';

type OwnerState = {
    expanded: boolean;
};

const StyledQuickFilter = styled(QuickFilter)({
    display: 'grid',
    alignItems: 'center',
});

const StyledToolbarButton = styled(ToolbarButton)<{ ownerState: OwnerState }>(
    ({ theme, ownerState }) => ({
        gridArea: '1 / 1',
        width: 'min-content',
        height: 'min-content',
        zIndex: 1,
        opacity: ownerState.expanded ? 0 : 1,
        pointerEvents: ownerState.expanded ? 'none' : 'auto',
        transition: theme.transitions.create(['opacity']),
    }),
);

const StyledTextField = styled(TextField)<{
    ownerState: OwnerState;
}>(({ theme, ownerState }) => ({
    gridArea: '1 / 1',
    overflowX: 'clip',
    width: ownerState.expanded ? 260 : 'var(--trigger-width)',
    opacity: ownerState.expanded ? 1 : 0,
    transition: theme.transitions.create(['width', 'opacity']),
}));

const DENISTY_OPTIONS: { label: string; value: GridDensity }[] = [
    { label: 'Compacto', value: 'compact' },
    { label: 'Padrão', value: 'standard' },
    { label: 'Confortável', value: 'comfortable' },
];

interface CustomDataGridProps<T extends GridValidRowModel> {
    title: string;
    rows: T[];
    columns: GridColDef<T>[];
    loading: boolean;
    onAdd?: () => void;
    getRowId?: (row: T) => GridRowId;
    onImport?: () => void;
}

export const CustomDataGrid = <T extends GridValidRowModel>({
    title,
    rows,
    columns,
    loading,
    onAdd,
    getRowId,
    onImport
}: CustomDataGridProps<T>) => {

    function CustomToolbar() {
        const [exportMenuOpen, setExportMenuOpen] = React.useState(false);
        const exportMenuTriggerRef = React.useRef<HTMLButtonElement>(null);
        const apiRef = useGridApiContext();
        const density = useGridSelector(apiRef, gridDensitySelector);
        const [densityMenuOpen, setDensityMenuOpen] = React.useState(false);
        const densityMenuTriggerRef = React.useRef<HTMLButtonElement>(null);

        return (
            <Toolbar>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', flex: 1, mx: 0.5 }}>
                    {title}
                </Typography>

                <Tooltip title="Colunas">
                    <ColumnsPanelTrigger render={<ToolbarButton />}>
                        <ViewColumnIcon fontSize="small" />
                    </ColumnsPanelTrigger>
                </Tooltip>

                <Tooltip title="Filtros">
                    <FilterPanelTrigger
                        render={(props, state) => (
                            <ToolbarButton {...props} color="default">
                                <Badge badgeContent={state.filterCount} color="primary" variant="dot">
                                    <FilterListIcon fontSize="small" />
                                </Badge>
                            </ToolbarButton>
                        )}
                    />
                </Tooltip>

                <Tooltip title="Densidade">
                    <ToolbarButton
                        ref={densityMenuTriggerRef}
                        onClick={() => setDensityMenuOpen(true)}
                    >
                        <TableRowsIcon fontSize="small" sx={{ ml: 'auto' }} />
                    </ToolbarButton>
                </Tooltip>

                <Menu
                    anchorEl={densityMenuTriggerRef.current}
                    open={densityMenuOpen}
                    onClose={() => setDensityMenuOpen(false)}
                >
                    {DENISTY_OPTIONS.map((option) => (
                        <MenuItem
                            key={option.value}
                            onClick={() => {
                                apiRef.current.setDensity(option.value);
                                setDensityMenuOpen(false);
                            }}
                        >
                            <ListItemIcon>
                                {density === option.value && <CheckIcon fontSize="small" />}
                            </ListItemIcon>
                            <ListItemText>{option.label}</ListItemText>
                        </MenuItem>
                    ))}
                </Menu>

                <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />

                <Tooltip title="Exportar">
                    <ToolbarButton
                        ref={exportMenuTriggerRef}
                        onClick={() => setExportMenuOpen(true)}
                    >
                        <FileDownloadIcon fontSize="small" />
                    </ToolbarButton>
                </Tooltip>

                <Menu
                    anchorEl={exportMenuTriggerRef.current}
                    open={exportMenuOpen}
                    onClose={() => setExportMenuOpen(false)}
                >
                    <ExportPrint render={<MenuItem />} onClick={() => setExportMenuOpen(false)}>
                        Imprimir
                    </ExportPrint>
                    <ExportCsv render={<MenuItem />} onClick={() => setExportMenuOpen(false)}>
                        Baixar como .CSV
                    </ExportCsv>
                </Menu>

                <StyledQuickFilter>
                    <QuickFilterTrigger
                        render={(triggerProps, state) => (
                            <Tooltip title="Pesquisar" enterDelay={0}>
                                <StyledToolbarButton
                                    {...triggerProps}
                                    ownerState={{ expanded: state.expanded }}
                                >
                                    <SearchIcon fontSize="small" />
                                </StyledToolbarButton>
                            </Tooltip>
                        )}
                    />
                    <QuickFilterControl
                        render={({ ref, ...controlProps }, state) => (
                            <StyledTextField
                                {...controlProps}
                                ownerState={{ expanded: state.expanded }}
                                inputRef={ref}
                                placeholder="Pesquisar..."
                                size="small"
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: state.value ? (
                                            <InputAdornment position="end">
                                                <QuickFilterClear>
                                                    <CancelIcon fontSize="small" />
                                                </QuickFilterClear>
                                            </InputAdornment>
                                        ) : null,
                                    },
                                }}
                            />
                        )}
                    />
                </StyledQuickFilter>
                {onAdd && <Tooltip title={`Adicionar ${title.slice(0, -1)}`}>
                    <ToolbarButton
                        onClick={onAdd}
                    >
                        <AddIcon fontSize="small" />
                    </ToolbarButton>
                </Tooltip>}

                {onImport && <Tooltip title={`Importar`}>
                    <ToolbarButton
                        onClick={onImport}
                    >
                        <PublishIcon fontSize="small" />
                    </ToolbarButton>
                </Tooltip>}
            </Toolbar>
        );
    }

    return (
        <Box sx={{ height: 'calc(100vh - 100px)', width: '100%' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                pageSizeOptions={[5, 10, 50, 100]}
                disableRowSelectionOnClick
                slots={{ toolbar: CustomToolbar }}
                showToolbar
                getRowId={getRowId}
                initialState={{
                    pagination: { paginationModel: { pageSize: 50 } },
                    sorting: { sortModel: [{ field: 'id', sort: 'asc' }] },
                }}
                localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
            />
        </Box>
    );
};