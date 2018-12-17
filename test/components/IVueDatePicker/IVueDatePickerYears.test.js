import IVueDatePickerYears from '../../../src/components/IVueDatePicker/IVueDatePickerYears';
import { mount } from '@vue/test-utils';

describe('IVueDatePickerYears', function () {
      it('should respect min/max props', async () => {
            const wrapper = mount(IVueDatePickerYears, {
                  propsData: {
                        tableDate: '2017',
                        current: '2017-05',
                        value: '2017-11',
                        min: '2011',
                        max: '2018'
                  }
            });

            expect(wrapper.findAll('.ivue-button').at(1).element.textContent).to.be.equal('2011');
            expect(wrapper.findAll('.ivue-button').at(8).element.textContent).to.be.equal('2018');
      });

      it('should emit event on year click', async () => {
            const wrapper = mount(IVueDatePickerYears, {
                  propsData: {
                        tableDate: '2017',
                        current: '2017-05',
                        value: '2017-11'
                  }
            });

            let input;
            wrapper.vm.$on('input', function (value) {
                  input = value;
            });

            wrapper.find('.ivue-button').trigger('click');

            expect(input).to.be.equal('2010');
      });
});