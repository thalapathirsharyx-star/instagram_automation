import { Injectable, BadRequestException } from '@nestjs/common';
import { product as ProductTable } from '@Database/Table/CRM/product';

@Injectable()
export class ProductCatalogService {
  async getProducts(companyId: string) {
    return await ProductTable.find({
      where: { company_id: companyId },
      order: { created_on: 'DESC' }
    });
  }

  async addProduct(companyId: string, data: any) {
    if (!data.name || data.price === undefined) {
      throw new BadRequestException("Product name and price are required");
    }

    const newProduct = new ProductTable();
    newProduct.company_id = companyId;
    newProduct.name = data.name;
    newProduct.price = parseFloat(data.price) || 0;
    newProduct.variants = typeof data.variants === 'object' ? JSON.stringify(data.variants) : data.variants || '';
    newProduct.stock_quantity = parseInt(data.stock_quantity, 10) || 0;
    newProduct.sku = data.sku || '';
    newProduct.images = data.images || '';
    newProduct.description = data.description || '';
    newProduct.created_by_id = '0';
    newProduct.created_on = new Date();

    await newProduct.save();
    return newProduct;
  }

  async updateProduct(companyId: string, productId: string, data: any) {
    const existingProduct = await ProductTable.findOne({
      where: { id: productId, company_id: companyId }
    });

    if (!existingProduct) {
      throw new BadRequestException("Product not found or access denied");
    }

    if (data.name !== undefined) existingProduct.name = data.name;
    if (data.price !== undefined) existingProduct.price = parseFloat(data.price) || 0;
    if (data.variants !== undefined) {
      existingProduct.variants = typeof data.variants === 'object' ? JSON.stringify(data.variants) : data.variants || '';
    }
    if (data.stock_quantity !== undefined) existingProduct.stock_quantity = parseInt(data.stock_quantity, 10) || 0;
    if (data.sku !== undefined) existingProduct.sku = data.sku;
    if (data.images !== undefined) existingProduct.images = data.images;
    if (data.description !== undefined) existingProduct.description = data.description;
    
    existingProduct.updated_by_id = '0';
    existingProduct.updated_on = new Date();

    await existingProduct.save();
    return existingProduct;
  }

  async deleteProduct(companyId: string, productId: string) {
    const existingProduct = await ProductTable.findOne({
      where: { id: productId, company_id: companyId }
    });

    if (!existingProduct) {
      throw new BadRequestException("Product not found or access denied");
    }

    await ProductTable.remove(existingProduct);
    return { success: true };
  }

  async decrementStock(companyId: string, sku: string, quantity: number, options?: { size?: string; color?: string }) {
    const existingProduct = await ProductTable.findOne({
      where: { sku, company_id: companyId }
    });

    if (!existingProduct) {
      throw new BadRequestException(`Product with SKU ${sku} not found`);
    }

    // Check if variant options are specified and product has variants configured
    if (options && (options.size || options.color) && existingProduct.variants) {
      try {
        const variantsObj = JSON.parse(existingProduct.variants);
        if (variantsObj.inventory && Array.isArray(variantsObj.inventory)) {
          // Find matching item in inventory list
          const item = variantsObj.inventory.find((inv: any) => {
            const sizeMatch = !options.size || !inv.size || inv.size.toLowerCase() === options.size.toLowerCase();
            const colorMatch = !options.color || !inv.color || inv.color.toLowerCase() === options.color.toLowerCase();
            return sizeMatch && colorMatch;
          });

          if (item) {
            if (item.stock < quantity) {
              throw new BadRequestException(`Insufficient stock for variant (Size: ${options.size || 'Any'}, Color: ${options.color || 'Any'}). Available: ${item.stock}`);
            }
            item.stock -= quantity;
            existingProduct.variants = JSON.stringify(variantsObj);

            // Re-calculate total stock quantity
            existingProduct.stock_quantity = variantsObj.inventory.reduce((sum: number, i: any) => sum + (parseInt(i.stock, 10) || 0), 0);
            
            existingProduct.updated_on = new Date();
            await existingProduct.save();
            return existingProduct;
          }
        }
      } catch (err: any) {
        console.error('[STOCK DECREMENT VARIANT ERROR] Falling back to global decrement:', err.message);
      }
    }

    // Fallback: Global stock decrement if no variant match or not configured
    if (existingProduct.stock_quantity < quantity) {
      throw new BadRequestException(`Insufficient stock for SKU ${sku}. Available: ${existingProduct.stock_quantity}`);
    }

    existingProduct.stock_quantity -= quantity;
    existingProduct.updated_on = new Date();
    await existingProduct.save();

    return existingProduct;
  }

  async queryCatalog(companyId: string, query: string) {
    // Basic text search over SKU, Name, and Description
    const lowerQuery = query.toLowerCase();
    const products = await ProductTable.find({
      where: { company_id: companyId }
    });

    return products.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) || 
      (p.sku && p.sku.toLowerCase().includes(lowerQuery)) || 
      (p.description && p.description.toLowerCase().includes(lowerQuery))
    );
  }
}
