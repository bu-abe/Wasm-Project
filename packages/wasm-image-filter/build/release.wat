(module
 (type $0 (func (param i32 i32)))
 (type $1 (func (param i32 i32 i32)))
 (type $2 (func (param i32 i32 i32 i32 i32)))
 (type $3 (func (param i32) (result i32)))
 (type $4 (func (param i32 i32) (result i32)))
 (memory $0 256)
 (export "fibonacci" (func $assembly/index/fibonacci))
 (export "add" (func $assembly/index/add))
 (export "grayscaleFilter" (func $assembly/index/grayscaleFilter))
 (export "brightnessFilter" (func $assembly/index/brightnessFilter))
 (export "contrastFilter" (func $assembly/index/contrastFilter))
 (export "saturationFilter" (func $assembly/index/saturationFilter))
 (export "sepiaFilter" (func $assembly/index/sepiaFilter))
 (export "invertFilter" (func $assembly/index/invertFilter))
 (export "boxBlurFilter" (func $assembly/index/boxBlurFilter))
 (export "sharpenFilter" (func $assembly/index/sharpenFilter))
 (export "memory" (memory $0))
 (func $assembly/index/fibonacci (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  local.get $0
  i32.const 1
  i32.le_s
  if
   local.get $0
   return
  end
  i32.const 1
  local.set $1
  i32.const 2
  local.set $4
  loop $for-loop|0
   local.get $0
   local.get $4
   i32.ge_s
   if
    local.get $1
    local.get $2
    i32.add
    local.get $1
    local.set $2
    local.set $1
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  local.get $1
 )
 (func $assembly/index/add (param $0 i32) (param $1 i32) (result i32)
  local.get $0
  local.get $1
  i32.add
 )
 (func $assembly/index/grayscaleFilter (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  local.set $2
  loop $for-loop|0
   local.get $2
   local.get $0
   local.get $1
   i32.add
   i32.lt_u
   if
    local.get $2
    local.get $2
    i32.load8_u
    f32.convert_i32_u
    f32.const 0.29899999499320984
    f32.mul
    local.get $2
    i32.const 1
    i32.add
    i32.load8_u
    f32.convert_i32_u
    f32.const 0.5870000123977661
    f32.mul
    f32.add
    local.get $2
    i32.const 2
    i32.add
    i32.load8_u
    f32.convert_i32_u
    f32.const 0.11400000005960464
    f32.mul
    f32.add
    i32.trunc_sat_f32_u
    local.tee $3
    i32.store8
    local.get $2
    local.get $3
    i32.store8 offset=1
    local.get $2
    local.get $3
    i32.store8 offset=2
    local.get $2
    i32.const 4
    i32.add
    local.set $2
    br $for-loop|0
   end
  end
 )
 (func $assembly/index/brightnessFilter (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  local.get $0
  local.set $3
  loop $for-loop|0
   local.get $3
   local.get $0
   local.get $1
   i32.add
   i32.lt_u
   if
    local.get $3
    i32.const 1
    i32.add
    i32.load8_u
    local.get $2
    i32.add
    local.set $4
    local.get $3
    i32.const 2
    i32.add
    i32.load8_u
    local.get $2
    i32.add
    local.set $5
    local.get $3
    i32.const 255
    local.get $3
    i32.load8_u
    local.get $2
    i32.add
    local.tee $6
    local.get $6
    i32.const 255
    i32.gt_s
    select
    local.tee $6
    i32.const 0
    local.get $6
    i32.const 0
    i32.ge_s
    select
    i32.store8
    local.get $3
    i32.const 255
    local.get $4
    local.get $4
    i32.const 255
    i32.gt_s
    select
    local.tee $4
    i32.const 0
    local.get $4
    i32.const 0
    i32.ge_s
    select
    i32.store8 offset=1
    local.get $3
    i32.const 255
    local.get $5
    local.get $5
    i32.const 255
    i32.gt_s
    select
    local.tee $4
    i32.const 0
    local.get $4
    i32.const 0
    i32.ge_s
    select
    i32.store8 offset=2
    local.get $3
    i32.const 4
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
 )
 (func $assembly/index/contrastFilter (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 f32)
  (local $4 f32)
  (local $5 f32)
  local.get $2
  i32.const 255
  i32.add
  i32.const 259
  i32.mul
  f32.convert_i32_s
  i32.const 259
  local.get $2
  i32.sub
  i32.const 255
  i32.mul
  f32.convert_i32_s
  f32.div
  local.set $3
  local.get $0
  local.set $2
  loop $for-loop|0
   local.get $2
   local.get $0
   local.get $1
   i32.add
   i32.lt_u
   if
    local.get $3
    local.get $2
    i32.const 1
    i32.add
    i32.load8_u
    f32.convert_i32_u
    f32.const -128
    f32.add
    f32.mul
    f32.const 128
    f32.add
    local.set $4
    local.get $3
    local.get $2
    i32.const 2
    i32.add
    i32.load8_u
    f32.convert_i32_u
    f32.const -128
    f32.add
    f32.mul
    f32.const 128
    f32.add
    local.set $5
    local.get $2
    local.get $3
    local.get $2
    i32.load8_u
    f32.convert_i32_u
    f32.const -128
    f32.add
    f32.mul
    f32.const 128
    f32.add
    f32.const 255
    f32.min
    f32.const 0
    f32.max
    i32.trunc_sat_f32_u
    i32.store8
    local.get $2
    local.get $4
    f32.const 255
    f32.min
    f32.const 0
    f32.max
    i32.trunc_sat_f32_u
    i32.store8 offset=1
    local.get $2
    local.get $5
    f32.const 255
    f32.min
    f32.const 0
    f32.max
    i32.trunc_sat_f32_u
    i32.store8 offset=2
    local.get $2
    i32.const 4
    i32.add
    local.set $2
    br $for-loop|0
   end
  end
 )
 (func $assembly/index/saturationFilter (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 f32)
  (local $4 f32)
  (local $5 f32)
  (local $6 f32)
  (local $7 f32)
  local.get $2
  f32.convert_i32_s
  f32.const 100
  f32.add
  f32.const 100
  f32.div
  local.set $4
  local.get $0
  local.set $2
  loop $for-loop|0
   local.get $2
   local.get $0
   local.get $1
   i32.add
   i32.lt_u
   if
    local.get $2
    local.get $2
    i32.load8_u
    f32.convert_i32_u
    local.tee $5
    f32.const 0.29899999499320984
    f32.mul
    local.get $2
    i32.const 1
    i32.add
    i32.load8_u
    f32.convert_i32_u
    local.tee $6
    f32.const 0.5870000123977661
    f32.mul
    f32.add
    local.get $2
    i32.const 2
    i32.add
    i32.load8_u
    f32.convert_i32_u
    local.tee $7
    f32.const 0.11400000005960464
    f32.mul
    f32.add
    local.tee $3
    local.get $4
    local.get $5
    local.get $3
    f32.sub
    f32.mul
    f32.add
    f32.const 255
    f32.min
    f32.const 0
    f32.max
    i32.trunc_sat_f32_u
    i32.store8
    local.get $2
    local.get $3
    local.get $4
    local.get $6
    local.get $3
    f32.sub
    f32.mul
    f32.add
    f32.const 255
    f32.min
    f32.const 0
    f32.max
    i32.trunc_sat_f32_u
    i32.store8 offset=1
    local.get $2
    local.get $3
    local.get $4
    local.get $7
    local.get $3
    f32.sub
    f32.mul
    f32.add
    f32.const 255
    f32.min
    f32.const 0
    f32.max
    i32.trunc_sat_f32_u
    i32.store8 offset=2
    local.get $2
    i32.const 4
    i32.add
    local.set $2
    br $for-loop|0
   end
  end
 )
 (func $assembly/index/sepiaFilter (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 f32)
  (local $4 f32)
  (local $5 f32)
  local.get $0
  local.set $2
  loop $for-loop|0
   local.get $2
   local.get $0
   local.get $1
   i32.add
   i32.lt_u
   if
    local.get $2
    local.get $2
    i32.load8_u
    f32.convert_i32_u
    local.tee $3
    f32.const 0.3930000066757202
    f32.mul
    local.get $2
    i32.const 1
    i32.add
    i32.load8_u
    f32.convert_i32_u
    local.tee $4
    f32.const 0.7689999938011169
    f32.mul
    f32.add
    local.get $2
    i32.const 2
    i32.add
    i32.load8_u
    f32.convert_i32_u
    local.tee $5
    f32.const 0.1889999955892563
    f32.mul
    f32.add
    f32.const 255
    f32.min
    i32.trunc_sat_f32_u
    i32.store8
    local.get $2
    local.get $3
    f32.const 0.3490000069141388
    f32.mul
    local.get $4
    f32.const 0.6859999895095825
    f32.mul
    f32.add
    local.get $5
    f32.const 0.1679999977350235
    f32.mul
    f32.add
    f32.const 255
    f32.min
    i32.trunc_sat_f32_u
    i32.store8 offset=1
    local.get $2
    local.get $3
    f32.const 0.2720000147819519
    f32.mul
    local.get $4
    f32.const 0.5339999794960022
    f32.mul
    f32.add
    local.get $5
    f32.const 0.13099999725818634
    f32.mul
    f32.add
    f32.const 255
    f32.min
    i32.trunc_sat_f32_u
    i32.store8 offset=2
    local.get $2
    i32.const 4
    i32.add
    local.set $2
    br $for-loop|0
   end
  end
 )
 (func $assembly/index/invertFilter (param $0 i32) (param $1 i32)
  (local $2 i32)
  local.get $0
  local.set $2
  loop $for-loop|0
   local.get $2
   local.get $0
   local.get $1
   i32.add
   i32.lt_u
   if
    local.get $2
    i32.const 255
    local.get $2
    i32.load8_u
    i32.sub
    i32.store8
    local.get $2
    i32.const 1
    i32.add
    i32.const 255
    local.get $2
    i32.load8_u offset=1
    i32.sub
    i32.store8
    local.get $2
    i32.const 2
    i32.add
    i32.const 255
    local.get $2
    i32.load8_u offset=2
    i32.sub
    i32.store8
    local.get $2
    i32.const 4
    i32.add
    local.set $2
    br $for-loop|0
   end
  end
 )
 (func $assembly/index/boxBlurFilter (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 f32)
  (local $8 f32)
  (local $9 f32)
  (local $10 f32)
  (local $11 f32)
  (local $12 i32)
  (local $13 i32)
  (local $14 i32)
  (local $15 i32)
  (local $16 i32)
  local.get $4
  i32.const 1
  i32.shl
  i32.const 1
  i32.add
  f32.convert_i32_u
  local.set $7
  loop $for-loop|0
   local.get $3
   local.get $6
   i32.gt_u
   if
    f32.const 0
    local.set $8
    f32.const 0
    local.set $9
    f32.const 0
    local.set $10
    f32.const 0
    local.set $11
    i32.const 0
    local.get $4
    i32.sub
    local.set $5
    loop $for-loop|1
     local.get $4
     local.get $5
     i32.ge_s
     if
      local.get $8
      local.get $0
      local.get $2
      local.get $6
      i32.mul
      local.get $2
      i32.const 1
      i32.sub
      local.tee $13
      local.get $5
      local.get $5
      local.get $13
      i32.gt_s
      select
      local.tee $13
      i32.const 0
      local.get $13
      i32.const 0
      i32.ge_s
      select
      i32.add
      i32.const 2
      i32.shl
      i32.add
      local.tee $13
      i32.load8_u
      f32.convert_i32_u
      f32.add
      local.set $8
      local.get $9
      local.get $13
      i32.load8_u offset=1
      f32.convert_i32_u
      f32.add
      local.set $9
      local.get $10
      local.get $13
      i32.load8_u offset=2
      f32.convert_i32_u
      f32.add
      local.set $10
      local.get $11
      local.get $13
      i32.load8_u offset=3
      f32.convert_i32_u
      f32.add
      local.set $11
      local.get $5
      i32.const 1
      i32.add
      local.set $5
      br $for-loop|1
     end
    end
    local.get $1
    local.get $2
    local.get $6
    i32.mul
    i32.const 2
    i32.shl
    i32.add
    local.tee $5
    local.get $8
    local.get $7
    f32.div
    i32.trunc_sat_f32_u
    i32.store8
    local.get $5
    local.get $9
    local.get $7
    f32.div
    i32.trunc_sat_f32_u
    i32.store8 offset=1
    local.get $5
    local.get $10
    local.get $7
    f32.div
    i32.trunc_sat_f32_u
    i32.store8 offset=2
    local.get $5
    local.get $11
    local.get $7
    f32.div
    i32.trunc_sat_f32_u
    i32.store8 offset=3
    i32.const 1
    local.set $5
    loop $for-loop|2
     local.get $2
     local.get $5
     i32.gt_u
     if
      local.get $8
      local.get $0
      local.get $2
      local.get $6
      i32.mul
      local.tee $15
      local.get $5
      local.get $4
      i32.sub
      i32.const 1
      i32.sub
      local.tee $13
      i32.const 0
      local.get $13
      i32.const 0
      i32.ge_s
      select
      i32.add
      i32.const 2
      i32.shl
      i32.add
      local.tee $13
      i32.load8_u
      f32.convert_i32_u
      f32.sub
      local.get $0
      local.get $15
      local.get $2
      i32.const 1
      i32.sub
      local.tee $14
      local.get $4
      local.get $5
      i32.add
      local.tee $16
      local.get $14
      local.get $16
      i32.lt_s
      select
      i32.add
      i32.const 2
      i32.shl
      i32.add
      local.tee $14
      i32.load8_u
      f32.convert_i32_u
      f32.add
      local.set $8
      local.get $9
      local.get $13
      i32.load8_u offset=1
      f32.convert_i32_u
      f32.sub
      local.get $14
      i32.load8_u offset=1
      f32.convert_i32_u
      f32.add
      local.set $9
      local.get $10
      local.get $13
      i32.load8_u offset=2
      f32.convert_i32_u
      f32.sub
      local.get $14
      i32.load8_u offset=2
      f32.convert_i32_u
      f32.add
      local.set $10
      local.get $11
      local.get $13
      i32.load8_u offset=3
      f32.convert_i32_u
      f32.sub
      local.get $14
      i32.load8_u offset=3
      f32.convert_i32_u
      f32.add
      local.set $11
      local.get $1
      local.get $5
      local.get $15
      i32.add
      i32.const 2
      i32.shl
      i32.add
      local.tee $13
      local.get $8
      local.get $7
      f32.div
      i32.trunc_sat_f32_u
      i32.store8
      local.get $13
      local.get $9
      local.get $7
      f32.div
      i32.trunc_sat_f32_u
      i32.store8 offset=1
      local.get $13
      local.get $10
      local.get $7
      f32.div
      i32.trunc_sat_f32_u
      i32.store8 offset=2
      local.get $13
      local.get $11
      local.get $7
      f32.div
      i32.trunc_sat_f32_u
      i32.store8 offset=3
      local.get $5
      i32.const 1
      i32.add
      local.set $5
      br $for-loop|2
     end
    end
    local.get $6
    i32.const 1
    i32.add
    local.set $6
    br $for-loop|0
   end
  end
  loop $for-loop|3
   local.get $2
   local.get $12
   i32.gt_u
   if
    f32.const 0
    local.set $8
    f32.const 0
    local.set $9
    f32.const 0
    local.set $10
    f32.const 0
    local.set $11
    i32.const 0
    local.get $4
    i32.sub
    local.set $5
    loop $for-loop|4
     local.get $4
     local.get $5
     i32.ge_s
     if
      local.get $8
      local.get $1
      local.get $3
      i32.const 1
      i32.sub
      local.tee $6
      local.get $5
      local.get $5
      local.get $6
      i32.gt_s
      select
      local.tee $6
      i32.const 0
      local.get $6
      i32.const 0
      i32.ge_s
      select
      local.get $2
      i32.mul
      local.get $12
      i32.add
      i32.const 2
      i32.shl
      i32.add
      local.tee $6
      i32.load8_u
      f32.convert_i32_u
      f32.add
      local.set $8
      local.get $9
      local.get $6
      i32.load8_u offset=1
      f32.convert_i32_u
      f32.add
      local.set $9
      local.get $10
      local.get $6
      i32.load8_u offset=2
      f32.convert_i32_u
      f32.add
      local.set $10
      local.get $11
      local.get $6
      i32.load8_u offset=3
      f32.convert_i32_u
      f32.add
      local.set $11
      local.get $5
      i32.const 1
      i32.add
      local.set $5
      br $for-loop|4
     end
    end
    local.get $0
    local.get $12
    i32.const 2
    i32.shl
    i32.add
    local.tee $5
    local.get $8
    local.get $7
    f32.div
    i32.trunc_sat_f32_u
    i32.store8
    local.get $5
    local.get $9
    local.get $7
    f32.div
    i32.trunc_sat_f32_u
    i32.store8 offset=1
    local.get $5
    local.get $10
    local.get $7
    f32.div
    i32.trunc_sat_f32_u
    i32.store8 offset=2
    local.get $5
    local.get $11
    local.get $7
    f32.div
    i32.trunc_sat_f32_u
    i32.store8 offset=3
    i32.const 1
    local.set $5
    loop $for-loop|5
     local.get $3
     local.get $5
     i32.gt_u
     if
      local.get $8
      local.get $1
      local.get $5
      local.get $4
      i32.sub
      i32.const 1
      i32.sub
      local.tee $6
      i32.const 0
      local.get $6
      i32.const 0
      i32.ge_s
      select
      local.get $2
      i32.mul
      local.get $12
      i32.add
      i32.const 2
      i32.shl
      i32.add
      local.tee $6
      i32.load8_u
      f32.convert_i32_u
      f32.sub
      local.get $1
      local.get $3
      i32.const 1
      i32.sub
      local.tee $13
      local.get $4
      local.get $5
      i32.add
      local.tee $14
      local.get $13
      local.get $14
      i32.lt_s
      select
      local.get $2
      i32.mul
      local.get $12
      i32.add
      i32.const 2
      i32.shl
      i32.add
      local.tee $13
      i32.load8_u
      f32.convert_i32_u
      f32.add
      local.set $8
      local.get $9
      local.get $6
      i32.load8_u offset=1
      f32.convert_i32_u
      f32.sub
      local.get $13
      i32.load8_u offset=1
      f32.convert_i32_u
      f32.add
      local.set $9
      local.get $10
      local.get $6
      i32.load8_u offset=2
      f32.convert_i32_u
      f32.sub
      local.get $13
      i32.load8_u offset=2
      f32.convert_i32_u
      f32.add
      local.set $10
      local.get $11
      local.get $6
      i32.load8_u offset=3
      f32.convert_i32_u
      f32.sub
      local.get $13
      i32.load8_u offset=3
      f32.convert_i32_u
      f32.add
      local.set $11
      local.get $0
      local.get $2
      local.get $5
      i32.mul
      local.get $12
      i32.add
      i32.const 2
      i32.shl
      i32.add
      local.tee $6
      local.get $8
      local.get $7
      f32.div
      i32.trunc_sat_f32_u
      i32.store8
      local.get $6
      local.get $9
      local.get $7
      f32.div
      i32.trunc_sat_f32_u
      i32.store8 offset=1
      local.get $6
      local.get $10
      local.get $7
      f32.div
      i32.trunc_sat_f32_u
      i32.store8 offset=2
      local.get $6
      local.get $11
      local.get $7
      f32.div
      i32.trunc_sat_f32_u
      i32.store8 offset=3
      local.get $5
      i32.const 1
      i32.add
      local.set $5
      br $for-loop|5
     end
    end
    local.get $12
    i32.const 1
    i32.add
    local.set $12
    br $for-loop|3
   end
  end
  local.get $1
  local.get $0
  local.get $2
  local.get $3
  i32.mul
  i32.const 2
  i32.shl
  memory.copy
 )
 (func $assembly/index/sharpenFilter (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32)
  (local $5 f32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 f32)
  (local $11 f32)
  local.get $4
  f32.convert_i32_s
  f32.const 100
  f32.div
  local.tee $10
  f32.const 4
  f32.mul
  f32.const 1
  f32.add
  local.set $5
  local.get $10
  f32.neg
  local.set $10
  loop $for-loop|0
   local.get $3
   local.get $7
   i32.gt_u
   if
    i32.const 0
    local.set $6
    loop $for-loop|1
     local.get $2
     local.get $6
     i32.gt_u
     if
      local.get $0
      local.get $2
      local.get $7
      i32.mul
      local.get $6
      i32.add
      i32.const 2
      i32.shl
      i32.add
      local.set $8
      i32.const 0
      local.set $4
      loop $for-loop|2
       local.get $4
       i32.const 3
       i32.lt_u
       if
        local.get $5
        local.get $4
        local.get $8
        i32.add
        i32.load8_u
        f32.convert_i32_u
        f32.mul
        local.set $11
        local.get $7
        if (result f32)
         local.get $11
         local.get $10
         local.get $0
         local.get $7
         i32.const 1
         i32.sub
         local.get $2
         i32.mul
         local.get $6
         i32.add
         i32.const 2
         i32.shl
         i32.add
         local.get $4
         i32.add
         i32.load8_u
         f32.convert_i32_u
         f32.mul
         f32.add
        else
         local.get $11
         local.get $10
         local.get $4
         local.get $8
         i32.add
         i32.load8_u
         f32.convert_i32_u
         f32.mul
         f32.add
        end
        local.set $11
        local.get $7
        local.get $3
        i32.const 1
        i32.sub
        i32.lt_u
        if (result f32)
         local.get $11
         local.get $10
         local.get $0
         local.get $7
         i32.const 1
         i32.add
         local.get $2
         i32.mul
         local.get $6
         i32.add
         i32.const 2
         i32.shl
         i32.add
         local.get $4
         i32.add
         i32.load8_u
         f32.convert_i32_u
         f32.mul
         f32.add
        else
         local.get $11
         local.get $10
         local.get $4
         local.get $8
         i32.add
         i32.load8_u
         f32.convert_i32_u
         f32.mul
         f32.add
        end
        local.set $11
        local.get $6
        if (result f32)
         local.get $11
         local.get $10
         local.get $0
         local.get $2
         local.get $7
         i32.mul
         local.get $6
         i32.add
         i32.const 1
         i32.sub
         i32.const 2
         i32.shl
         i32.add
         local.get $4
         i32.add
         i32.load8_u
         f32.convert_i32_u
         f32.mul
         f32.add
        else
         local.get $11
         local.get $10
         local.get $4
         local.get $8
         i32.add
         i32.load8_u
         f32.convert_i32_u
         f32.mul
         f32.add
        end
        local.set $11
        local.get $1
        local.get $2
        local.get $7
        i32.mul
        local.get $6
        i32.add
        local.tee $9
        i32.const 2
        i32.shl
        i32.add
        local.get $4
        i32.add
        local.get $6
        local.get $2
        i32.const 1
        i32.sub
        i32.lt_u
        if (result f32)
         local.get $11
         local.get $10
         local.get $0
         local.get $9
         i32.const 1
         i32.add
         i32.const 2
         i32.shl
         i32.add
         local.get $4
         i32.add
         i32.load8_u
         f32.convert_i32_u
         f32.mul
         f32.add
        else
         local.get $11
         local.get $10
         local.get $4
         local.get $8
         i32.add
         i32.load8_u
         f32.convert_i32_u
         f32.mul
         f32.add
        end
        f32.const 255
        f32.min
        f32.const 0
        f32.max
        i32.trunc_sat_f32_u
        i32.store8
        local.get $4
        i32.const 1
        i32.add
        local.set $4
        br $for-loop|2
       end
      end
      local.get $1
      local.get $2
      local.get $7
      i32.mul
      local.get $6
      i32.add
      i32.const 2
      i32.shl
      i32.add
      local.get $8
      i32.load8_u offset=3
      i32.store8 offset=3
      local.get $6
      i32.const 1
      i32.add
      local.set $6
      br $for-loop|1
     end
    end
    local.get $7
    i32.const 1
    i32.add
    local.set $7
    br $for-loop|0
   end
  end
 )
)
