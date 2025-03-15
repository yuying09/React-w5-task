import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Modal } from "bootstrap";
import { useForm } from "react-hook-form";
import ClipLoader from "react-spinners/ClipLoader";

const baseUrl = import.meta.env.VITE_BASE_URL;
const apiPath = import.meta.env.VITE_API_PATH;



function App() {
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState([]);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isScreenLoading, setIsScreenLoading] = useState(false);
  const [isBtnLoading, setIsBtnLoading] = useState(false);
  const onSubmit = handleSubmit((data) => {
    console.log(data);

    const { message, ...user } = data;
    const userInfo = {
      data: {
        user,
        message
      }
    }
    console.log(userInfo);

    checkout(userInfo)
  })

  const checkout = async (data) => {
    try {
      await axios.post(`${baseUrl}/v2/api/${apiPath}/order`, data)

    } catch (error) {
      alert("結帳失敗")
    }
  }

  useEffect(() => {
    const getProducts = async () => {
      setIsScreenLoading(true)
      try {
        const res = await axios.get(`${baseUrl}/v2/api/${apiPath}/products`);
        setProducts(res.data.products);
      } catch (error) {
        alert("取得產品失敗");
      } finally {
        setIsScreenLoading(false)
      }
    };
    getProducts();
    getCart()
  }, []);

  const productModalRef = useRef(null);
  useEffect(() => {
    new Modal(productModalRef.current, { backdrop: false });
  }, []);

  const openModal = () => {
    const modalInstance = Modal.getInstance(productModalRef.current);
    modalInstance.show();
  };

  const closeModal = () => {
    const modalInstance = Modal.getInstance(productModalRef.current);
    modalInstance.hide();
  };

  const handleSeeMore = (product) => {
    setTempProduct(product);
    openModal();
  };

  const [qtySelect, setQtySelect] = useState(1);

  const addCartItem = async (product_id, qty) => {
    setIsBtnLoading(true)
    try {
      await axios.post(`${baseUrl}/v2/api/${apiPath}/cart`, {
        data:
        {
          product_id,
          qty: Number(qty)
        }
      })
      getCart()
    } catch (error) {
      alert("加入購物車失敗")
    } finally {
      setIsBtnLoading(false)
    }
  }


  const removeCartItem = async (id) => {
    setIsScreenLoading(true)
    try {
      await axios.delete(`${baseUrl}/v2/api/${apiPath}/cart/${id}`
      )
      getCart()
    } catch (error) {
      alert("刪除購物車產品失敗")
    } finally {
      setIsScreenLoading(false)
    }
  }

  const clearCartItem = async () => {
    setIsScreenLoading(true)
    try {
      await axios.delete(`${baseUrl}/v2/api/${apiPath}/carts`
      )
      getCart()
    } catch (error) {
      alert("清空購物車產品失敗")
    } finally {
      setIsScreenLoading(false)
    }
  }

  const updateCartItemQty = async (cartItem_id, product_id, qty) => {
    setIsScreenLoading(true)
    try {
      await axios.put(`${baseUrl}/v2/api/${apiPath}/cart/${cartItem_id}`, {
        "data": {
          product_id,
          qty: Number(qty)
        }
      })
      getCart()
    } catch (error) {
      alert("更新購物車產品數量失敗")
    } finally {
      setIsScreenLoading(false)
    }
  }



  const [cart, setCart] = useState({ carts: [] });

  const getCart = async () => {
    try {
      const res = await axios.get(`${baseUrl}/v2/api/${apiPath}/cart`);
      setCart(res.data.data)
      console.log(res.data.data);
    } catch (error) {
      alert("購物車取得失敗")
    }
  }


  return (
    <div className="container">
      <div className="mt-4">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>圖片</th>
              <th>商品名稱</th>
              <th>價格</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td style={{ width: "200px" }}>
                  {product.imageUrl && <img
                    className="img-fluid"
                    src={product.imageUrl}
                    alt={product.title}
                  />}

                </td>
                <td>{product.title}</td>
                <td>
                  <del className="h6">原價 {product.origin_price} 元</del>
                  <div className="h5">特價 {product.origin_price}元</div>
                </td>
                <td>
                  <div className="btn-group btn-group-sm">
                    <button
                      onClick={() => handleSeeMore(product)}
                      type="button"
                      className="btn btn-outline-secondary"
                    >
                      查看更多
                    </button>
                    <button disabled={isBtnLoading} type="button" onClick={() => addCartItem(product.id, 1)} className="btn btn-outline-danger d-flex align-items-center gap-2">
                      加到購物車
                      {isBtnLoading && (<ClipLoader
                        color="red"
                        size={15}
                      />)}

                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div
          ref={productModalRef}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          className="modal fade"
          id="productModal"
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title fs-5">
                  產品名稱：{tempProduct.title}
                </h2>
                <button
                  onClick={closeModal}
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <img
                  src={tempProduct.imageUrl}
                  alt={tempProduct.title}
                  className="img-fluid"
                />
                <p>內容：{tempProduct.content}</p>
                <p>描述：{tempProduct.description}</p>
                <p>
                  價錢：{tempProduct.price}{" "}
                  <del>{tempProduct.origin_price}</del> 元
                </p>
                <div className="input-group align-items-center">
                  <label htmlFor="qtySelect">數量：</label>
                  <select
                    value={qtySelect}
                    onChange={(e) => setQtySelect(e.target.value)}
                    id="qtySelect"
                    className="form-select"
                  >
                    {Array.from({ length: 10 }).map((_, index) => (
                      <option key={index} value={index + 1}>
                        {index + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button disabled={isBtnLoading} type="button" onClick={() => {
                  addCartItem(tempProduct.id, qtySelect); setTimeout(() => {
                    closeModal();
                  }, 1000)}} className="btn btn-primary d-flex align-items-center gap-2">
                  加入購物車
                  {isBtnLoading && (<ClipLoader
                    color="white"
                    size={15}
                  />)}

                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-end py-3">
          <button className="btn btn-outline-danger" onClick={() => clearCartItem()} type="button">
            清空購物車
          </button>
        </div>

        <table className="table align-middle">
          <thead>
            <tr>
              <th></th>
              <th>品名</th>
              <th style={{ width: "150px" }}>數量/單位</th>
              <th className="text-end">單價</th>
            </tr>

          </thead>

          <tbody>
            {cart.carts.map((cartItem) => (
              <tr key={cartItem.id}>
                <td>
                  <button type="button" onClick={() => removeCartItem(cartItem.id)} className="btn btn-outline-danger btn-sm">
                    x
                  </button>
                </td>
                <td>{cartItem.product.title}</td>
                <td style={{ width: "150px" }}>
                  <div className="d-flex align-items-center">
                    <div className="btn-group me-2" role="group">
                      <button
                        type="button"
                        className="btn btn-outline-dark btn-sm"
                        onClick={() => updateCartItemQty(cartItem.id, cartItem.product_id, cartItem.qty - 1)}
                        disabled={cartItem.qty === 1}
                      >
                        -
                      </button>
                      <span
                        className="btn border border-dark"
                        style={{ width: "50px", cursor: "auto" }}
                      >{cartItem.qty}</span>
                      <button
                        type="button"
                        className="btn btn-outline-dark btn-sm"
                        onClick={() => updateCartItemQty(cartItem.id, cartItem.product_id, cartItem.qty + 1)}
                      >
                        +
                      </button>
                    </div>
                    <span className="input-group-text bg-transparent border-0">
                      {cartItem.product.unit}
                    </span>
                  </div>
                </td>
                <td className="text-end">{cartItem.final_total}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3" className="text-end">
                總計：{cart.final_total}
              </td>
              <td className="text-end" style={{ width: "130px" }}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="my-5 row justify-content-center">
        <form onSubmit={onSubmit} className="col-md-6">
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              {...register("email", {
                required: "email欄位為必填",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "email格式有誤"
                }
              })}
              id="email"
              type="email"
              className={`form-control ${errors.email && "is-invalid"}`}
              placeholder="請輸入 Email"
            />
            {errors.email && <p className="text-danger my-2">{errors.email.message}</p>}

          </div>

          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              收件人姓名
            </label>
            <input
              {...register("name", {
                required: "姓名欄位為必填",
              })}
              id="name"
              className={`form-control ${errors.name && "is-invalid"}`}
              placeholder="請輸入姓名"
            />
            {errors.name && <p className="text-danger my-2">{errors.name.message}</p>}
          </div>

          <div className="mb-3">
            <label htmlFor="tel" className="form-label">
              收件人電話
            </label>
            <input
              {...register("tel", {
                required: "電話欄位為必填",
                pattern: {
                  value: /^(0[2-8]\d{7}|09\d{8})$/,
                  message: "電話格式有誤"
                }
              })}
              id="tel"
              type="text"
              className={`form-control ${errors.tel && "is-invalid"}`}
              placeholder="請輸入電話"
            />
            {errors.tel && <p className="text-danger my-2">{errors.tel.message}</p>}

          </div>

          <div className="mb-3">
            <label htmlFor="address" className="form-label">
              收件人地址
            </label>
            <input
              {...register("address", {
                required: "收件人地址為必填"
              })}
              id="address"
              type="text"
              className={`form-control ${errors.address && "is-invalid"}`}
              placeholder="請輸入地址"
            />
            {errors.address && <p className="text-danger my-2">{errors.address.message}</p>}

          </div>

          <div className="mb-3">
            <label htmlFor="message" className="form-label">
              留言
            </label>
            <textarea
              {...register("message")}
              id="message"
              className="form-control"
              cols="30"
              rows="10"
            ></textarea>
          </div>
          <div className="text-end">
            <button type="submit" className="btn btn-danger">
              送出訂單
            </button>
          </div>
        </form>
      </div>


      {/* loading */}
      {isScreenLoading && (
        <div className="sweet-loading d-flex justify-content-center align-items-center"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(255,255,255,0.3)",
            zIndex: 999,
          }}>
          <ClipLoader
            color="grey"
            size={30}
          />
        </div>)
      }





    </div>
  );
}

export default App;
