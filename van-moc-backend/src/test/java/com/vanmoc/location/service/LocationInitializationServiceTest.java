package com.vanmoc.location.service;

import com.vanmoc.location.dto.importdata.LocationDataset;
import com.vanmoc.location.client.OpenApiLocationClient;
import com.vanmoc.location.repository.LocationImportRepository;
import com.vanmoc.location.dto.importdata.ProvinceData;
import com.vanmoc.location.dto.importdata.WardData;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class LocationInitializationServiceTest {
    private final OpenApiLocationClient source = mock(OpenApiLocationClient.class);
    private final LocationImportRepository importer = mock(LocationImportRepository.class);
    private final LocationInitializationService useCase = new LocationInitializationService(source, importer);

    private LocationDataset dataset(Integer provinceCode) {
        return new LocationDataset(List.of(new ProvinceData(1, "Hà Nội", "thành phố", "ha_noi")),
                List.of(new WardData(4, provinceCode, "Ba Đình", "phường", "phuong_ba_dinh")));
    }

    @Test
    void disabledDoesNotAccessNetworkOrDatabase() {
        assertFalse(useCase.execute(LocationInitializationService.Mode.DISABLED).imported());
        verifyNoInteractions(source, importer);
    }

    @Test
    void populatedDatabaseIsSkipped() {
        when(importer.hasProvincesAndWards()).thenReturn(true);
        assertFalse(useCase.execute(LocationInitializationService.Mode.IF_EMPTY).imported());
        verifyNoInteractions(source);
        verify(importer, never()).importDataset(any());
    }

    @Test
    void emptyDatabaseIsImported() {
        var data = dataset(1);
        when(source.fetch()).thenReturn(data);
        var result = useCase.execute(LocationInitializationService.Mode.IF_EMPTY);
        assertTrue(result.imported());
        assertEquals(1, result.provinceCount());
        assertEquals(1, result.wardCount());
        verify(importer).importDataset(data);
    }

    @Test
    void refreshDoesNotCheckExistingData() {
        when(source.fetch()).thenReturn(dataset(1));
        useCase.execute(LocationInitializationService.Mode.REFRESH);
        verify(importer, never()).hasProvincesAndWards();
        verify(importer).importDataset(any());
    }

    @Test
    void invalidDatasetIsNeverWritten() {
        when(source.fetch()).thenReturn(dataset(999));
        assertThrows(IllegalStateException.class, () -> useCase.execute(LocationInitializationService.Mode.REFRESH));
        verifyNoInteractions(importer);
    }

    @Test
    void emptyDatasetIsNeverWritten() {
        when(source.fetch()).thenReturn(new LocationDataset(List.of(), List.of()));
        assertThrows(IllegalStateException.class, () -> useCase.execute(LocationInitializationService.Mode.REFRESH));
        verifyNoInteractions(importer);
    }

    @Test
    void duplicateCodesAreRejected() {
        var data = dataset(1);
        when(source.fetch()).thenReturn(new LocationDataset(data.provinces(),
                List.of(data.wards().getFirst(), data.wards().getFirst())));
        assertThrows(IllegalStateException.class, () -> useCase.execute(LocationInitializationService.Mode.REFRESH));
        verifyNoInteractions(importer);
    }

    @Test
    void networkFailurePropagatesWithoutWriting() {
        when(source.fetch()).thenThrow(new IllegalStateException("timeout"));
        assertThrows(IllegalStateException.class, () -> useCase.execute(LocationInitializationService.Mode.REFRESH));
        verifyNoInteractions(importer);
    }
}
