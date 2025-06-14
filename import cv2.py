import cv2 
import numpy as np 

# 定义去水印函数，接收图片路径和掩码路径作为参数
# 图片路径为待处理图片的路径，掩码路径为用户框选的水印区域，白色区域为水印
# 返回去水印后的图片
def remove_watermark(image_path, mask_path): 
    # 读取图片与掩码（mask_path为用户框选的水印区域，白色区域为水印） 
    img = cv2.imread(image_path) 
    mask = cv2.imread(mask_path, 0)  # 灰度图 
    # 去水印处理（INPAINT_NS：基于邻域采样） 
    result = cv2.inpaint(img, mask, 3, cv2.INPAINT_NS) 
    return result