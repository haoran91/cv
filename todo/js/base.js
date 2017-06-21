;(function function_name(argument) {
    // body...
    'use strict';

    var $form_add_task = $('.addTask')
        , $window = $(window)
        , $body = $('body')
        , $delete_task_trigger
        , $detail_task_trigger
        , $task_detail = $('.task_detail')
        , $task_detail_mask = $('.task_detail_mask')
        , task_list = []
        , current_index
        , $updata_form
        , $task_detail_content
        , $task_detail_content_input
        , $checkbox_complete
        , $msg = $('.msg')
        , $msg_content = $msg.find('.msg_content')
        , $msg_confirm = $msg.find('.confirmed')
        , $alerter = $('.alerter');

    init();

    $form_add_task.on('submit',on_add_task_form_sunmit);
    $task_detail_mask.on('click',hide_task_detail);

    function pop(arg){
        if(!arg) {
            console.error('pop title is required');
        }
        var conf = {} ,
            $box ,
            $mask ,
            $title ,
            $content ,
            $confirm ,
            $cancel ,
            timer ,
            dfd ,
            confirmed;

        dfd = $.Deferred();
        if(typeof arg == 'string'){
            conf.title = arg;
        }else{
            conf = $.extend(conf,arg);
        }

        $box = $('<div><div class="pop_title">' + conf.title + '</div><div class="pop_content">' +
            '<div><button style="margin-right: 5px" class="primary confirm">确定</button>' +
            '<button class="cancel">取消</button></div>' +
            '</div></div>').css({width: 300,
            height: 'auto',
            padding: '15px 20px 30px 20px',
            background: 'rgb(250,250,250)',
            position: 'fixed',
            'border-radius': 3,
            'box-shadow': '0 1px 3px rgba(0,0,0,.5)'
        });

        $title = $box.find('.pop_title').css({padding: '5px 10px',
            'font-weight': 900,
            'font-size': 20,
            'text-align': 'center'
        });
        $content = $box.find('.pop_content').css({padding: '5px 10px',
            'text-align': 'center'
        });
        $confirm = $content.find('button.confirm');
        $cancel = $content.find('button.cancel');

        $mask = $('<div></div>').css({position: 'fixed',
            top : 0,
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(0,0,0,.4)'
        });

        timer = setInterval(function(){
            if(confirmed !== undefined){
                dfd.resolve(confirmed);
                clearInterval(timer);
                dismiss_pop();
            }
        },50);

        $confirm.on('click', on_confirmed);
        $cancel.on('click', on_cancel);
        $mask.on('click', on_cancel);

        function on_confirmed(){
            confirmed = true;
        }
        function on_cancel(){
            confirmed = false;
        }

        function dismiss_pop(){
            $mask.remove();
            $box.remove();
        }

        function adjust_box_position(){
            var window_width = $window.width(),
                window_height = $window.height(),
                box_width = $box.width(),
                box_height = $box.height(),
                move_x = (window_width - box_width) / 2,
                move_y = 130;

            $box.css({left: move_x, top: move_y});
        }
        $window.on('resize',function(){
            adjust_box_position();
        });

        $mask.appendTo($body);
        $box.appendTo($body);
        $window.resize();
        return dfd.promise();
    }


    function listen_msg_event(){
        $msg_confirm.on('click',function(){
            hide_msg();
        })
    }

    function on_add_task_form_sunmit(e){
        var new_task = {},$input;
        // 禁用默认行为
        e.preventDefault();
        // 获取新task的值
        $input = $(this).find('input[name=content]');
        new_task.content = $input .val();
        // 如果新task的值为空直接返回，否则继续执行
        if(!new_task.content) return;
        // 存入新task值
        if(add_task(new_task)){
            // render_task_list();
            $input.val(null);
        }
    }

    function listen_task_detail(){
        var index;
        $('.task_item').on('dblclick',function(){
            index = $(this).data('index');
            show_task_detail(index);
        })

        $detail_task_trigger.on('click',function(){
            var $this = $(this);
            var $item = $this.parent().parent();
            index = $item.data('index');
            show_task_detail(index);
        })
    }
    //监听完成task事件
    function listen_task_complete(){
        $checkbox_complete.on('click',function(){
            var $this = $(this);
            var is_complete = $this.is(':checkbox');
            var index = $this.parent().parent().data('index');
            var item = get(index);
            if(item.complete){
                updata_task(index, {complete: false});
            }else{
                updata_task(index, {complete: true});
            }
        })
    }
    function get(index){
        return store.get('task_list')[index];
    }

    //查看task详情
    function show_task_detail(index){
        //生成详情模版
        render_task_detail(index);
        current_index = index;
        // 显示详情模版与mask（默认隐藏）
        $task_detail.show();
        $task_detail_mask.show();
    }
    // 更新task
    function updata_task(index,data){
        if(!index || !task_list[index]) return;
        task_list[index] = $.extend({}, task_list[index],data);
        refresh_task_list();
    }
    // 隐藏task详情及mask
    function hide_task_detail(){
        $task_detail.hide();
        $task_detail_mask.hide();
    }
    //渲染指定task的详细信息
    function render_task_detail(index){
        if(index === undefined || !task_list[index]) return;
        var item = task_list[index];
        var tpl =
            '<form>' +
            '<div class="content">' + item.content + '</div>' +
            '<div class="input_item"><input style="display:none;" type="text" name="content" value="' +
            item.content + '"></div>' +
            '<div>' +
            '<div class="desc">' + '<textarea name="desc">' + ( item.desc || '') + '</textarea>' +
            '</div>' +
            '</div>' +
            '<div class="remind input_item">' + '<label>提醒时间</label>' +
            '<input class="datetime" name="remind_data" type="text" value="' +
            (item.remind_data || '') + '">' + '<button type="submit">submit</button>' +
            '</div>' +
            '<div><button type="submit">更新</button></div>' +
            '</form>';
        // 用新模版替换旧模版
        $task_detail.html(null);
        $task_detail.html(tpl);
        $('.datetime').datetimepicker();
        // 选中form以便监听submit事件
        $updata_form = $task_detail.find('form');
        // 选中task标题元素
        $task_detail_content = $updata_form.find('.content');
        // 选中task input元素
        $task_detail_content_input = $updata_form.find('[name=content]');
        // 双击标题修改内容
        $task_detail_content.on('dblclick',function(){
            $task_detail_content_input.show();
            $task_detail_content.hide();
        })
        $updata_form.on('submit',function(e){
            e.preventDefault();
            var data = {};
            // 获取表单中各个input的值
            data.content = $(this).find('[name=content]').val();
            data.desc = $(this).find('[name=desc]').val();
            data.remind_data = $(this).find('[name=remind_data]').val();

            updata_task(index, data);
            hide_task_detail();
        })
    }

    function listen_task_delete(){
        $delete_task_trigger.on('click',function(){
            var $this = $(this);
            // 找到删除按钮所在的task元素
            var $item = $this.parent().parent();
            var index = $item.data('index');
            // 确认删除
            pop('确定删除吗')
                .then(function(r){
                    r ? delete_task(index) : null;
                });  //confirm
        })
    }

    function add_task(new_task){
        // 将新task值推入task_list
        task_list.push(new_task);
        // 更新localStorage
        refresh_task_list();
        return true;
    }
    //刷新localStorage数据，渲染模版
    function refresh_task_list(){
        store.set('task_list',task_list);
        render_task_list();
    }
    // 删除一条task
    function delete_task(index){
        // 如果没有index或者index不存在则返回
        if(!index || !task_list[index]) return;
        delete task_list[index];
        // 更新localStorage
        refresh_task_list();
    }

    function init(){
        task_list = store.get('task_list') || [];
        listen_msg_event();
        if(task_list.length){
            render_task_list();
        }
        task_remind_check();
    }
    function task_remind_check(){
        var current_timestamp;
        var itl = setInterval(function(){
            for(var i=0; i<task_list.length; i++){
                var item = get(i) , task_timestamp;
                if(!item || !item.remind_data || item.informed) continue;

                current_timestamp = (new Date()).getTime();
                task_timestamp = (new Date(item.remind_data)).getTime();
                if(current_timestamp - task_timestamp >= 1){
                    updata_task(i,{informed: true});
                    show_msg(item.content);
                }
            }
        },300);
    }
    function show_msg(msg){
        if(!msg) return;
        $msg_content.html(msg);
        $alerter.get(0).play();
        $msg.show();
    }
    function hide_msg(){
        $msg.hide();
    }

    // 渲染所有task模版
    function render_task_list(){
        var $task_list = $('.taskList');
        $task_list.html('');

        var complete_items = [];
        for(var i=0; i<task_list.length; i++){
            var item = task_list[i];
            if(item && item.complete){
                complete_items[i] = item;
            }else{
                var $task = render_task_item(item, i);
                $task_list.prepend($task);
            }
        }

        for(var j=0; j<complete_items.length; j++){
            $task = render_task_item(complete_items[j], j);
            if(!$task) continue;
            $task.addClass('completed');
            $task_list.append($task);
        }

        $delete_task_trigger = $('.action.delete');
        $detail_task_trigger = $('.action.detail');
        $checkbox_complete = $('.taskList .complete');
        listen_task_delete();
        listen_task_detail();
        listen_task_complete();
    }
    // 渲染单条task
    function render_task_item(data,index){
        if(!data || !index) return;
        var list_item_tpl =
            '<div class="task_item" data-index="' + index +'">' +
            '<span><input class="complete"' + (data.complete ? 'checked="checded"' : '') + 'type="checkbox"></span>' +
            '<span class="task_content">' + data.content + '</span>' +
            '<span class="fr">' +
            '<span class="action delete"> 删除</span>' +
            '<span class="action detail"> 详情</span>' +
            '</span>' +
            '</div>';

        return $(list_item_tpl);
    }

})();