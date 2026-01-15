import React, { forwardRef } from 'react';
import { Booking } from '@/app/lib/api';

interface ReceiptTemplateProps {
    booking?: Booking;
    hotelName?: string;
    hotelAddress?: string;
    hotelPhone?: string;
}

export const ReceiptTemplate = forwardRef<HTMLDivElement, ReceiptTemplateProps>(({
    booking,
}, ref) => {
    if (!booking) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-NG', {
            hour: 'numeric',
            minute: 'numeric',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount: string | number) => {
        return `₦${Number(amount).toLocaleString()}`;
    };

    return (
        <div ref={ref} className="receipt-container p-4 bg-white text-black font-mono text-xs w-[80mm] mx-auto hidden print:block">
            {/* Header */}
            <div className="text-center mb-4 border-b border-black pb-2">
                <h1 className="text-lg font-bold uppercase mb-1">Mayor K. Guest Palace</h1>
                <p className="text-[10px]">123, Sample Road, Lagos</p>
                <p className="text-[10px]">Tel: 08012345678</p>
            </div>

            {/* Transaction Details */}
            <div className="mb-4">
                <div className="flex justify-between mb-1">
                    <span>Receipt #:</span>
                    <span className="font-bold">{booking.booking_ref}</span>
                </div>
                <div className="flex justify-between mb-1">
                    <span>Date:</span>
                    <span>{formatDate(new Date().toString())}</span>
                </div>
                <div className="flex justify-between mb-1">
                    <span>Guest:</span>
                    <span className="font-bold">{booking.guest_name}</span>
                </div>
                <div className="flex justify-between">
                    <span>Room:</span>
                    <span>{booking.room_number} ({booking.stay_type_display})</span>
                </div>
            </div>

            {/* Line Items */}
            <div className="border-t border-b border-dashed border-black py-2 mb-4">
                <div className="flex justify-between font-bold mb-2">
                    <span>Description</span>
                    <span>Amount</span>
                </div>

                <div className="flex justify-between mb-1">
                    <span>Room Charge ({booking.num_nights} nights)</span>
                    <span>{formatCurrency(booking.total_room_charges)}</span>
                </div>

                {Number(booking.discount_amount) > 0 && (
                    <div className="flex justify-between mb-1 italic">
                        <span>Discount</span>
                        <span>-{formatCurrency(booking.discount_amount)}</span>
                    </div>
                )}

                {/* Future: Add Bar/Food items dynamically here */}
            </div>

            {/* Totals */}
            <div className="flex justify-between font-bold text-sm mb-1">
                <span>TOTAL DUE:</span>
                <span>{formatCurrency(booking.grand_total)}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
                <span>PAID:</span>
                <span>{formatCurrency(booking.amount_paid)}</span>
            </div>
            <div className={`flex justify-between font-bold text-sm border-t border-black pt-2 ${Number(booking.balance_due) > 0 ? 'text-black' : ''}`}>
                <span>BALANCE:</span>
                <span>{formatCurrency(booking.balance_due)}</span>
            </div>

            {/* Footer */}
            <div className="text-center mt-6 text-[10px] space-y-1">
                <p>Thank you for your patronage!</p>
                <p>Goods sold or services rendered are not refundable.</p>
                <p className="pt-2">Powered by Mayor K. System</p>
            </div>
        </div>
    );
});

ReceiptTemplate.displayName = 'ReceiptTemplate';
