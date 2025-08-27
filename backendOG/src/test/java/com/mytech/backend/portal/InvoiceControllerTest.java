package com.mytech.backend.portal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.mytech.backend.portal.apis.InvoiceController;
import com.mytech.backend.portal.models.OrderBooking;
import com.mytech.backend.portal.repositories.OrderBookingRepository;
import com.mytech.backend.portal.services.InvoiceService;

@WebMvcTest(controllers = InvoiceController.class)
@AutoConfigureMockMvc(addFilters = false)
class InvoiceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private InvoiceService invoiceService;
    @MockBean
    private OrderBookingRepository orderBookingRepository;
    

    @Test
    void testDownloadInvoice() throws Exception {
        byte[] fakePdf = "fake-pdf-content".getBytes();

        // ✅ tạo OrderBooking giả lập
        OrderBooking fakeOrder = new OrderBooking();
        fakeOrder.setId(5L);

        Mockito.when(orderBookingRepository.findById(5L))
               .thenReturn(Optional.of(fakeOrder));


        // ✅ mock service trả về PDF khi truyền OrderBooking
        Mockito.when(invoiceService.generateInvoicePDF(fakeOrder))
        .thenReturn("fake-pdf-content".getBytes());


        mockMvc.perform(get("/apis/orders/5/invoice"))
        .andExpect(status().isOk())
        .andExpect(header().string("Content-Disposition", "attachment; filename=invoice-5.pdf"))

        .andExpect(content().contentType(MediaType.APPLICATION_PDF))
        .andExpect(content().bytes("fake-pdf-content".getBytes()));

    }
}
