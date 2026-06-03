import { Controller, Get, Post, Delete, Body, Param, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductCatalogService } from '@Service/ProductCatalog.service';
import { JWTAuthController } from '@Controller/JWTAuth.controller';
import { ResponseEnum } from '@Helper/Enum/ResponseEnum';

@Controller({ path: "ProductCatalog", version: '1' })
@ApiTags("ProductCatalog")
@ApiTags("Products")
export class ProductCatalogController extends JWTAuthController {
  constructor(private _ProductCatalogService: ProductCatalogService) {
    super();
  }

  @Get('List')
  async GetProducts(@Req() req: any) {
    const user = req.user;
    if (!user || !user.company_id) {
      return this.SendResponse(ResponseEnum.Error, "No company associated with this account.");
    }
    const data = await this._ProductCatalogService.getProducts(user.company_id);
    return { Type: ResponseEnum.Success, Success: true, Data: data };
  }

  @Post('Add')
  async AddProduct(@Body() body: any, @Req() req: any) {
    const user = req.user;
    if (!user || !user.company_id) {
      return this.SendResponse(ResponseEnum.Error, "No company associated with this account.");
    }
    
    try {
      const data = await this._ProductCatalogService.addProduct(user.company_id, body);
      return { Type: ResponseEnum.Success, Success: true, Message: 'Product added successfully', Data: data };
    } catch (e: any) {
      return this.SendResponse(ResponseEnum.Error, e.message);
    }
  }

  @Post('Update/:id')
  async UpdateProduct(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const user = req.user;
    if (!user || !user.company_id) {
      return this.SendResponse(ResponseEnum.Error, "No company associated with this account.");
    }
    
    try {
      const data = await this._ProductCatalogService.updateProduct(user.company_id, id, body);
      return { Type: ResponseEnum.Success, Success: true, Message: 'Product updated successfully', Data: data };
    } catch (e: any) {
      return this.SendResponse(ResponseEnum.Error, e.message);
    }
  }

  @Delete('Delete/:id')
  async DeleteProduct(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    if (!user || !user.company_id) {
      return this.SendResponse(ResponseEnum.Error, "No company associated with this account.");
    }

    try {
      await this._ProductCatalogService.deleteProduct(user.company_id, id);
      return { Type: ResponseEnum.Success, Success: true, Message: "Product deleted successfully" };
    } catch (e: any) {
      return this.SendResponse(ResponseEnum.Error, e.message);
    }
  }

  @Post('DecrementStock')
  async DecrementStock(@Body() body: any, @Req() req: any) {
    const user = req.user;
    if (!user || !user.company_id) {
      return this.SendResponse(ResponseEnum.Error, "No company associated with this account.");
    }

    if (!body.sku || body.quantity === undefined) {
      return this.SendResponse(ResponseEnum.Error, "SKU and quantity are required.");
    }

    try {
      const data = await this._ProductCatalogService.decrementStock(user.company_id, body.sku, parseInt(body.quantity, 10));
      return { Type: ResponseEnum.Success, Success: true, Message: "Stock updated successfully", Data: data };
    } catch (e: any) {
      return this.SendResponse(ResponseEnum.Error, e.message);
    }
  }
}
